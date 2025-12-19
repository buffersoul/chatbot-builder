const express = require('express');
const router = express.Router();
const metaService = require('../services/metaService');
const MessageDispatcher = require('../services/meta/MessageDispatcher');
const { Company } = require('../models');

// Middleware to ensure company authentication
const { authenticate: authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route MAX /api/meta/auth-url
 * @desc Get Facebook OAuth URL
 */
router.get('/auth-url', authMiddleware, async (req, res) => {
    try {
        const companyId = req.user.company_id;
        // Construct callback URL based on environment
        const redirectUri = `${process.env.APP_URL}/api/meta/callback`;
        const url = metaService.getAuthUrl(companyId, redirectUri);
        res.json({ url });
    } catch (error) {
        console.error('Meta Auth URL Error:', error);
        res.status(500).json({ error: 'Failed to generate auth URL' });
    }
});

/**
 * @route GET /api/meta/callback
 * @desc Handle Facebook OAuth Callback
 */
router.get('/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;

        if (error) {
            return res.status(400).json({ error: 'Facebook Auth Failed' });
        }

        // Decode state to get companyId
        // State is base64(json({ companyId }))
        const stateJson = Buffer.from(state, 'base64').toString('ascii');
        const { companyId } = JSON.parse(stateJson);

        if (!companyId) {
            return res.status(400).json({ error: 'Invalid State' });
        }

        const redirectUri = `${process.env.APP_URL}/api/meta/callback`;
        const userToken = await metaService.exchangeCodeForToken(code, redirectUri);

        // Connect Pages
        const connectedPages = await metaService.connectPages(companyId, userToken);

        // Redirect to Frontend Dashboard with success
        // Assuming frontend is at localhost:5173 for dev, or same domain for prod.
        // We'll redirect to a generic success page or the integrations page.
        // For MVP: Redirect to frontend root? or /dashboard/integrations?
        // Let's guess the frontend URL from REFERER or hardcode defaults.
        const frontendUrl = `${process.env.FRONTEND_URL}/integrations?status=success`;

        res.redirect(frontendUrl);

    } catch (error) {
        console.error('Meta Callback Error:', error);
        res.status(500).send('Authentication Failed: ' + error.message);
    }
});

/**
 * @route GET /api/meta/webhook
 * @desc Webhook Verification
 */
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

/**
 * @route POST /api/meta/webhook
 * @desc Handle Incoming Events
 */
router.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object === 'page') {
            // Returns a '200 OK' response to all requests
            res.status(200).send('EVENT_RECEIVED');

            // Process asynchronously
            for (const entry of body.entry) {
                const webhookEvent = entry.messaging ? entry.messaging[0] : null;
                if (webhookEvent) {
                    await MessageDispatcher.dispatch(webhookEvent);
                }
            }
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        res.sendStatus(500);
    }
});

/**
 * @route GET /api/meta/assets
 * @desc List connected assets
 */
router.get('/assets', authMiddleware, async (req, res) => {
    try {
        const assets = await MetaAsset.findAll({
            where: { company_id: req.user.company_id },
            attributes: ['id', 'platform', 'asset_id', 'asset_name', 'is_active', 'connected_at']
        });
        res.json(assets);
    } catch (error) {
        console.error('List Assets Error:', error);
        res.status(500).json({ error: 'Failed to list assets' });
    }
});

/**
 * @route POST /api/meta/disconnect/:assetId
 * @desc Disconnect an asset
 */
router.post('/disconnect/:assetId', authMiddleware, async (req, res) => {
    try {
        const assetId = req.params.assetId;
        const deleted = await MetaAsset.destroy({
            where: {
                asset_id: assetId,
                company_id: req.user.company_id
            }
        });

        if (deleted) {
            res.json({ message: 'Asset disconnected successfully' });
        } else {
            res.status(404).json({ error: 'Asset not found' });
        }
    } catch (error) {
        console.error('Disconnect Asset Error:', error);
        res.status(500).json({ error: 'Failed to disconnect asset' });
    }
});

module.exports = router;
