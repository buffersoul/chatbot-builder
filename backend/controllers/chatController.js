const ragService = require('../services/ragService');
const conversationService = require('../services/conversationService');

/**
 * Send a message to the chatbot.
 * POST /api/chat/message
 */
const sendMessage = async (req, res) => {
    try {
        const { message, visitor_id } = req.body;
        console.log('DEBUG CHAT: Request Body:', req.body);
        console.log('DEBUG CHAT: User:', req.user);
        // In a real app, company_id might come from subdomain or API key.
        // For this SaaS MVP, we assume user is logged in OR visitor provides company_id context.
        // If it's a public widget, we'd need a public API key for the company.
        // For testing "internal" chat (RAG test page): use req.user.company_id

        // Check req.company_id (from middleware), then req.user.company_id, then body
        const companyId = req.company_id || (req.user && req.user.company_id) || req.body.company_id;

        console.log('DEBUG CHAT: Company ID:', companyId);

        if (!companyId || !message) {
            console.error('DEBUG CHAT: Missing ID or Message. Company:', companyId, 'Message:', message);
            return res.status(400).json({ error: 'Missing company_id or message' });
        }

        // Visitor ID identifies the chat session user (anonymous or logged in)
        // If not provided, we could generate one, but better to require it or use user id
        const visitorIdToUse = visitor_id || (req.user ? req.user.id : 'anonymous_visitor');

        const result = await ragService.executeRAGChatbot(companyId, visitorIdToUse, message);

        res.json(result);

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get conversation history.
 * GET /api/chat/history/:conversationId
 */
const getHistory = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const history = await conversationService.getHistory(conversationId);
        res.json(history);
    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    sendMessage,
    getHistory
};
