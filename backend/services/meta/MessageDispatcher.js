const { MetaAsset } = require('../../models');
const ragService = require('../ragService');
const metaService = require('../metaService');

class MessageDispatcher {
    /**
     * Dispatch incoming webhook event to appropriate handler
     * @param {Object} webhookEvent 
     */
    async dispatch(webhookEvent) {
        try {
            const senderId = webhookEvent.sender.id;
            const recipientId = webhookEvent.recipient.id;
            const message = webhookEvent.message;

            // 1. Ignore Echo messages (sent by the page itself)
            if (message.is_echo) {
                return;
            }

            // 2. Ignore non-text messages for now (attachments, etc.)
            if (!message.text) {
                console.log('Received non-text message, ignoring for MVP');
                return;
            }

            console.log(`Received Meta Message from ${senderId} to Page ${recipientId}: ${message.text}`);

            // 3. Find Company linked to this Page
            const asset = await MetaAsset.findOne({
                where: {
                    asset_id: recipientId,
                    platform: 'facebook'
                }
            });

            if (!asset) {
                console.warn(`No company found for Page ID ${recipientId}`);
                return;
            }

            const companyId = asset.company_id;
            const pageAccessToken = asset.access_token_encrypted;

            // 4. Execute RAG Pipeline with 'facebook' platform
            const result = await ragService.executeRAGChatbot(companyId, senderId, message.text, 'facebook');
            const responseText = result.response;

            // 5. Send Response back to User
            if (responseText) {
                await metaService.sendMessage(pageAccessToken, senderId, responseText);
            }

        } catch (error) {
            console.error('Message Dispatch Error:', error);
            // Don't throw, prevent webhook retry loops for internal errors if possible, 
            // or let it retry if transient. For now, logging.
        }
    }
}

module.exports = new MessageDispatcher();
