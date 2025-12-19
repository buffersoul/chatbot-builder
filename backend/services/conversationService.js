const { Conversation, Message, sequelize } = require('../models');

/**
 * Create a new conversation or get active one for visitor.
 * @param {String} companyId 
 * @param {String} visitorId 
 * @returns {Promise<Conversation>}
 */
const getOrCreateConversation = async (companyId, visitorId) => {
    try {
        let conversation = await Conversation.findOne({
            where: {
                company_id: companyId,
                visitor_id: visitorId,
                status: 'active'
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                company_id: companyId,
                visitor_id: visitorId,
                status: 'active',
                platform: 'web',
                metadata: { created_via: 'web_widget' }
            });
        }
        return conversation;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
};

/**
 * Add a message to the conversation.
 * @param {String} conversationId 
 * @param {String} role - 'user' or 'assistant'
 * @param {String} content 
 * @returns {Promise<Message>}
 */
const addMessage = async (conversationId, role, content) => {
    const direction = role === 'user' ? 'inbound' : 'outbound';
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return await Message.create({
        conversation_id: conversationId,
        message_id: messageId,
        direction,
        content,
        message_type: 'text'
    });
};

/**
 * Get conversation history.
 * @param {String} conversationId 
 * @param {Number} limit 
 * @returns {Promise<Array>}
 */
const getHistory = async (conversationId, limit = 20) => {
    return await Message.findAll({
        where: { conversation_id: conversationId },
        order: [['created_at', 'ASC']],
        limit
    });
};

module.exports = {
    getOrCreateConversation,
    addMessage,
    getHistory
};
