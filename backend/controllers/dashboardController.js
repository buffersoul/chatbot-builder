const { Conversation, Message, UsageRecord, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const companyId = req.company_id;

        // 1. Total Conversations
        const totalConversations = await Conversation.count({
            where: { company_id: companyId }
        });

        // 2. Total Messages
        const totalMessages = await Message.count({
            include: [{
                model: Conversation,
                as: 'conversation',
                where: { company_id: companyId }
            }]
        });

        // 3. AI Token Usage (Sum of total_tokens from usage_records)
        const tokenUsage = await UsageRecord.sum('total_tokens', {
            where: { company_id: companyId }
        });

        res.json({
            conversations: totalConversations || 0,
            messages: totalMessages || 0,
            tokens: tokenUsage || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const companyId = req.company_id;

        // Fetch top 5 recent conversations with their latest message
        // Note: This relies on your associations. Assuming Conversation.hasMany(Message)
        const recentConversations = await Conversation.findAll({
            where: { company_id: companyId },
            limit: 5,
            order: [['updated_at', 'DESC']],
            include: [{
                model: Message,
                as: 'messages', // Ensure this alias matches your model association
                limit: 1,
                order: [['created_at', 'DESC']],
                attributes: ['content', 'direction', 'created_at']
            }]
        });

        const activity = recentConversations.map(conv => {
            const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
            return {
                id: conv.id,
                visitor_id: conv.visitor_id, // Or customer_name if you have it
                platform: conv.platform,
                last_message: lastMessage ? lastMessage.content : 'No messages',
                last_message_at: conv.updatedAt,
                status: conv.status
            };
        });

        res.json(activity);

    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};
