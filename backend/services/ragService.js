const { GoogleGenerativeAI } = require("@google/generative-ai");
const retrievalService = require('./retrievalService');
const conversationService = require('./conversationService');

// Initialize Gemini Pro
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Main RAG Execution Flow.
 * @param {String} companyId 
 * @param {String} visitorId 
 * @param {String} userQuery 
 * @returns {Promise<String>}
 */
const executeRAGChatbot = async (companyId, visitorId, userQuery) => {
    try {
        // 1. Get Conversation Context
        const conversation = await conversationService.getOrCreateConversation(companyId, visitorId);

        // 2. Add User Message to History
        await conversationService.addMessage(conversation.id, 'user', userQuery);

        console.log(`Processing RAG for Co:${companyId} / Conv:${conversation.id} / Q:${userQuery}`);

        // 3. Retrieve Relevant Documents
        const similarChunks = await retrievalService.searchParams(companyId, userQuery);
        const contextText = retrievalService.formatContext(similarChunks);

        console.log(`Retrieved ${similarChunks.length} chunks`);

        // 4. Construct Prompt
        const systemPrompt = `You are a helpful AI assistant for a company. 
Use the following context to answer the user's question. 
If the answer is not in the context, politely urge the user to contact human support, but try to be helpful if common knowledge applies harmlessly.
Keep answers concise and professional.

Context:
${contextText}
`;

        // 5. Generate Response
        // Note: For full history awareness, we would convert 'history' to Gemini chat structure
        // For MVP, we'll try a single-turn generation with context, or simple chat session if supported.
        // Let's use simple generateContent for now, injecting history if needed, but 'context' is key here.

        const finalPrompt = `${systemPrompt}\n\nUser Question: ${userQuery}`;

        const result = await model.generateContent(finalPrompt);
        const responseText = result.response.text();

        // 6. Save Assistant Response
        await conversationService.addMessage(conversation.id, 'assistant', responseText);

        return {
            response: responseText,
            conversationId: conversation.id,
            sources: similarChunks.map(c => c.metadata?.source).filter(Boolean)
        };

    } catch (error) {
        console.error('RAG Execution Error:', error);
        throw error; // Let controller handle error response
    }
};

module.exports = {
    executeRAGChatbot
};
