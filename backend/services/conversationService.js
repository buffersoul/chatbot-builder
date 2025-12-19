const { Conversation, Message, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

/**
 * Create a new conversation or get active one for visitor.
 * @param {String} companyId 
 * @param {String} visitorId 
 * @returns {Promise<Conversation>}
 */
const getOrCreateConversation = async (companyId, visitorId, platform = 'web') => {
    try {
        let conversation = await Conversation.findOne({
            where: {
                company_id: companyId,
                visitor_id: visitorId,
                status: 'active',
                platform
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                company_id: companyId,
                visitor_id: visitorId,
                status: 'active',
                platform,
                metadata: { created_via: platform }
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
const addMessage = async (conversationId, role, content, metadata = {}) => {
    const direction = role === 'user' ? 'inbound' : 'outbound';
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return await Message.create({
        conversation_id: conversationId,
        message_id: messageId,
        direction,
        content,
        message_type: 'text',
        rag_context_used: metadata.rag_context || null,
        api_data_used: metadata.api_data || null
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

const listConversations = async (companyId, filters = {}, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const whereClause = { company_id: companyId };

    if (filters.status) whereClause.status = filters.status;
    if (filters.platform) whereClause.platform = filters.platform;
    if (filters.search) {
        whereClause.visitor_id = { [Op.iLike]: `%${filters.search}%` };
    }

    const { count, rows } = await Conversation.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['updated_at', 'DESC']],
        include: [
            {
                model: Message,
                as: 'messages',
                limit: 1,
                order: [['created_at', 'DESC']] // Get latest message
            }
        ]
    });

    return {
        conversations: rows,
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page
    };
};

module.exports = {
    getOrCreateConversation,
    addMessage,
    getHistory,
    listConversations
};
