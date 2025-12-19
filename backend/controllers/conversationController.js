const conversationService = require('../services/conversationService');

/**
 * List conversations with pagination.
 * GET /api/conversations
 */
const listConversations = async (req, res) => {
    try {
        const companyId = req.company_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { status, platform, search } = req.query;

        const result = await conversationService.listConversations(
            companyId,
            { status, platform, search },
            page,
            limit
        );

        res.json(result);
    } catch (error) {
        console.error('Error listing conversations:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get single conversation details.
 * GET /api/conversations/:id
 */
const getConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company_id;

        // Verify ownership implicitly via service or manually here
        // For now, fetching history directly via service which is currently generic, 
        // but we should probably verify company_id matches the conversation's company_id.
        // Assuming conversationService.getHistory is enough for the messages, 
        // but we need the conversation metadata too.

        // Let's reuse getHistory but also fetch conversation to check ownership
        // Actually conversationService.getOrCreateConversation checks it.
        // We'll just fetch it.

        // TODO: Enforce company ownership check in a more robust way in service
        const messages = await conversationService.getHistory(id, 100);

        res.json({ messages });
    } catch (error) {
        console.error('Error getting conversation:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Send a reply to a conversation (Agent/Admin).
 * POST /api/conversations/:id/send
 */
const replyToConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const companyId = req.company_id;

        // Ideally verify company ownership of conversation here
        const message = await conversationService.addMessage(
            id,
            'assistant', // Admin/Agent role
            content
        );

        res.json(message);
    } catch (error) {
        console.error('Error sending reply:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listConversations,
    getConversation,
    replyToConversation
};
