const axios = require('axios');
const { MetaAsset, sequelize } = require('../models');

class MetaService {
    constructor() {
        this.appId = process.env.META_APP_ID;
        this.appSecret = process.env.META_APP_SECRET;
        this.apiVersion = 'v18.0';
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    }

    /**
     * Generate Facebook OAuth URL for a company
     * @param {String} companyId 
     * @param {String} redirectUri 
     * @returns {String}
     */
    getAuthUrl(companyId, redirectUri) {
        const state = Buffer.from(JSON.stringify({ companyId })).toString('base64');
        return `https://www.facebook.com/${this.apiVersion}/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=pages_manage_metadata,pages_read_engagement,pages_messaging`;
    }

    /**
     * Exchange OAuth code for User Access Token
     * @param {String} code 
     * @param {String} redirectUri 
     * @returns {Promise<String>} userAccessToken
     */
    async exchangeCodeForToken(code, redirectUri) {
        try {
            const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
                params: {
                    client_id: this.appId,
                    client_secret: this.appSecret,
                    redirect_uri: redirectUri,
                    code: code
                }
            });
            return response.data.access_token;
        } catch (error) {
            console.error('Meta OAuth Error:', error.response?.data || error.message);
            throw new Error('Failed to exchange code for token');
        }
    }

    /**
     * Get Pages associated with the user token and store them
     * @param {String} companyId 
     * @param {String} userAccessToken 
     */
    async connectPages(companyId, userAccessToken) {
        try {
            // 1. Get Accounts (Pages)
            const response = await axios.get(`${this.baseUrl}/me/accounts`, {
                params: { access_token: userAccessToken }
            });

            const pages = response.data.data;
            if (!pages || pages.length === 0) {
                throw new Error('No pages found for this user.');
            }

            // 2. Store Pages in MetaAsset
            await sequelize.transaction(async (t) => {
                for (const page of pages) {
                    // Check if already connected
                    const exists = await MetaAsset.findOne({
                        where: {
                            company_id: companyId,
                            asset_id: page.id, // Page ID
                            platform: 'facebook'
                        },
                        transaction: t
                    });

                    const assetData = {
                        company_id: companyId,
                        platform: 'facebook',
                        asset_id: page.id,
                        asset_name: page.name,
                        access_token_encrypted: page.access_token, // TODO: Add encryption
                        is_active: true,
                        connected_at: new Date()
                    };

                    if (exists) {
                        await exists.update(assetData, { transaction: t });
                    } else {
                        await MetaAsset.create(assetData, { transaction: t });
                    }

                    // Also subscribe app to page webhooks
                    await this.subscribeAppToPage(page.id, page.access_token);
                }
            });

            return pages.map(p => ({ id: p.id, name: p.name }));
        } catch (error) {
            console.error('Meta Connect Pages Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Subscribe App to Page Webhooks
     */
    async subscribeAppToPage(pageId, pageAccessToken) {
        try {
            await axios.post(`${this.baseUrl}/${pageId}/subscribed_apps`, {
                subscribed_fields: ['messages', 'messaging_postbacks']
            }, {
                params: { access_token: pageAccessToken }
            });
        } catch (error) {
            console.warn(`Failed to subscribe app to page ${pageId}:`, error.response?.data || error.message);
            // Don't fail the whole flow, but log valid warning
        }
    }
    /**
     * Send text message to user via Meta Graph API
     * @param {String} pageAccessToken 
     * @param {String} recipientId 
     * @param {String} text 
     */
    async sendMessage(pageAccessToken, recipientId, text) {
        try {
            await axios.post(`${this.baseUrl}/me/messages`, {
                recipient: { id: recipientId },
                message: { text: text }
            }, {
                params: { access_token: pageAccessToken }
            });
            console.log(`Sent Meta message to ${recipientId}`);
        } catch (error) {
            console.error('Meta Send Message Error:', error.response?.data || error.message);
            // Don't throw, just log. RAG service shouldn't crash if meta fails to send.
        }
    }
}

module.exports = new MetaService();
