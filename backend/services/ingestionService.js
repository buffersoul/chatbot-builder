const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { TaskGenerativeAI } = require('@google/generative-ai'); // Use official SDK if langchain wrapper needs it, but langchain handles it internally usually.
const { Document, Embedding } = require('../models');
const crypto = require('crypto');

// Initialize Gemini Embeddings
const { TaskType } = require("@google/generative-ai");

// Initialize Gemini Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // Ensure this matches your model access
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document",
    apiKey: process.env.GOOGLE_API_KEY
});

/**
 * Parse file buffer to text.
 * @param {Buffer} buffer 
 * @param {String} fileType - 'pdf', 'docx', 'txt'
 * @returns {Promise<String>}
 */
const parseDocument = async (buffer, fileType) => {
    try {
        if (fileType === 'pdf') {
            const data = await pdf(buffer);
            return data.text;
        } else if (fileType === 'docx') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (fileType === 'txt') {
            return buffer.toString('utf-8');
        } else {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
    } catch (error) {
        console.error(`Error parsing ${fileType}:`, error);
        throw error;
    }
};

/**
 * Split text into chunks.
 * @param {String} text 
 * @returns {Promise<Array<String>>}
 */
const chunkText = async (text) => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
    });
    return await splitter.splitText(text);
};

/**
 * Process a document: Parse -> Chunk -> Embed -> Save.
 * @param {String} documentId 
 * @param {Buffer} fileBuffer 
 * @param {String} fileType 
 */
const processDocument = async (documentId, fileBuffer, fileType) => {
    const document = await Document.findByPk(documentId);
    if (!document) {
        console.error(`Document ${documentId} not found`);
        return;
    }

    try {
        await document.update({ status: 'processing', ingestion_started_at: new Date() });

        console.log(`Starting processing for doc: ${documentId} (${fileType})`);

        // 1. Parse
        const text = await parseDocument(fileBuffer, fileType);
        if (!text || text.trim().length === 0) {
            throw new Error('Extracted text is empty');
        }

        // 2. Chunk
        const chunks = await chunkText(text);
        console.log(`Generated ${chunks.length} chunks for doc: ${documentId}`);

        // 3. Embed & Save (Batch processing recommended for large docs)
        // For simplicity in MVP, we process in serial or small batches

        // Delete old embeddings if re-processing
        await Embedding.destroy({ where: { document_id: documentId } });

        const embeddingRecords = [];

        // Process in batches of 10 to avoid hitting API limits
        const batchSize = 10;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);

            // Generate embeddings for the batch
            // Langchain method: embedDocuments(texts: string[])
            const vectors = await embeddings.embedDocuments(batch);

            // Prepare records
            for (let j = 0; j < batch.length; j++) {
                embeddingRecords.push({
                    id: crypto.randomUUID(),
                    company_id: document.company_id,
                    bot_id: document.bot_id,
                    document_id: documentId,
                    chunk_text: batch[j],
                    chunk_index: i + j,
                    embedding: vectors[j],
                    metadata: { source: document.filename }
                });
            }
        }

        // 4. Bulk Create
        await Embedding.bulkCreate(embeddingRecords);

        await document.update({
            status: 'completed',
            chunk_count: chunks.length,
            ingestion_completed_at: new Date()
        });

        console.log(`Successfully processed doc: ${documentId}`);

    } catch (error) {
        console.error(`Ingestion error for doc ${documentId}:`, error);
        await document.update({
            status: 'failed',
            error_message: error.message
        });
    }
};

module.exports = {
    processDocument
};
