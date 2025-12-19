const express = require('express');
const router = express.Router();
const stripeService = require('../services/billing/stripeService');
const usageService = require('../services/billing/usageService');
const { PricingTier, Company } = require('../models');

// Auth Middleware (Lazy load to avoid circular deps if any)
const { authenticate: authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route GET /api/billing/plans
 * @desc Get available pricing plans
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = await PricingTier.findAll({
            attributes: ['tier_name', 'display_name', 'monthly_base_price', 'annual_base_price', 'included_messages', 'included_tokens', 'features'],
            order: [['monthly_base_price', 'ASC']]
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

/**
 * @route GET /api/billing/usage
 * @desc Get current usage stats
 */
router.get('/usage', authMiddleware, async (req, res) => {
    try {
        const stats = await usageService.getUsageStats(req.company_id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch usage' });
    }
});

/**
 * @route POST /api/billing/checkout
 * @desc Create Stripe Checkout Session for subscription
 */
router.post('/checkout', authMiddleware, async (req, res) => {
    try {
        const { tier_name, interval } = req.body;
        const url = await stripeService.createSubscriptionCheckout(req.company_id, tier_name, interval);
        res.json({ url });
    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /api/billing/portal
 * @desc Create Customer Portal Session
 */
router.post('/portal', authMiddleware, async (req, res) => {
    try {
        const url = await stripeService.createPortalSession(req.company_id);
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

/**
 * @route GET /api/billing/invoices
 * @desc Get invoice history
 */
router.get('/invoices', authMiddleware, async (req, res) => {
    try {
        const invoices = await stripeService.getInvoices(req.company_id);
        res.json(invoices);
    } catch (error) {
        console.error('Fetch Invoices Error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

/**
 * @route POST /api/billing/webhook
 * @desc Handle Stripe Webhooks (No Auth)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['stripe-signature'];

    try {
        await stripeService.handleWebhook(signature, req.body);
        res.json({ received: true });
    } catch (error) {
        console.error('Stripe Webhook Error:', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

module.exports = router;
