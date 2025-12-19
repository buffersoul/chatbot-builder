const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { TaskType } = require("@google/generative-ai");
const { Embedding, sequelize } = require('../models');

// Reuse or recreate instance - safer to recreate or export shared one. 
// For now, new instance to avoid circular deps or complex file sharing yet.
const embeddingsModel = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    taskType: TaskType.RETRIEVAL_QUERY, // Important: Query type for search
    apiKey: process.env.GOOGLE_API_KEY
});

/**
 * Search for relevant document chunks.
 * @param {String} companyId 
 * @param {String} query 
 * @param {Number} limit 
 * @returns {Promise<Array>}
 */
const searchParams = async (companyId, query, limit = 30) => {
    try {
        // 1. Generate Query Embedding
        const queryVector = await embeddingsModel.embedQuery(query);

        // 2. Vector Search (Cosine Similarity)
        // Note: pgvector's <=> is cosine distance. 
        // We cast the vector to the correct array type for the replacement.
        // Sequelize valid replacement for array is just the array itself, but typically needs casting in raw SQL if not handled by plugin.
        // With pgvector-sequelize (if we used it) it handles it. 
        // Here we use raw query for best control over the vector operator.

        const vectorString = `[${queryVector.join(',')}]`;

        const results = await sequelize.query(
            `SELECT 
                id, 
                chunk_text, 
                metadata, 
                1 - (embedding <=> :vector) as similarity
             FROM embeddings
             WHERE company_id = :companyId
             ORDER BY embedding <=> :vector
             LIMIT :limit`,
            {
                replacements: {
                    vector: vectorString,
                    companyId: companyId,
                    limit: limit
                },
                type: sequelize.QueryTypes.SELECT
            }
        );

        return results;

    } catch (error) {
        console.error('Retrieval error:', error);
        throw error;
    }
};

/**
 * Format retrieved chunks into context string.
 * @param {Array} results 
 * @returns {String}
 */
const formatContext = (results) => {
    return results.map(r => r.chunk_text).join('\n\n');
};

module.exports = {
    searchParams,
    formatContext
};
