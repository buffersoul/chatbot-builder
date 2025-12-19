const Stripe = require('stripe');
const { Company, PricingTier, BillingInvoice, sequelize } = require('../../models');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Stripe Service for Subscription Management
 */
class StripeService {

    /**
     * Get or Create Stripe Customer
     * @param {Object} company 
     * @returns {Object} Stripe Customer
     */
    async getOrCreateCustomer(company) {
        if (company.stripe_customer_id) {
            return await stripe.customers.retrieve(company.stripe_customer_id);
        }

        const customer = await stripe.customers.create({
            email: company.email,
            name: company.name,
            metadata: {
                company_id: company.id
            }
        });

        await company.update({ stripe_customer_id: customer.id });
        return customer;
    }

    /**
     * Create Checkout Session for Subscription
     * @param {String} companyId 
     * @param {String} tierName 
     * @param {String} interval 'monthly' or 'annual'
     */
    async createSubscriptionCheckout(companyId, tierName, interval = 'monthly') {
        const company = await Company.findByPk(companyId);
        const tier = await PricingTier.findOne({ where: { tier_name: tierName } });

        if (!company || !tier) throw new Error("Invalid Company or Tier");

        const customer = await this.getOrCreateCustomer(company);
        const priceId = interval === 'monthly' ? tier.stripe_price_id : tier.stripe_annual_price_id;

        if (!priceId) throw new Error("Price ID not configured for this tier");

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?status=canceled`,
            metadata: {
                company_id: companyId,
                tier_name: tierName,
                interval: interval
            }
        });

        return session.url;
    }

    /**
     * Create Customer Portal Session
     */
    async createPortalSession(companyId) {
        const company = await Company.findByPk(companyId);
        if (!company || !company.stripe_customer_id) throw new Error("No Stripe Customer found");

        const session = await stripe.billingPortal.sessions.create({
            customer: company.stripe_customer_id,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing`
        });

        return session.url;
    }

    /**
     * Handle Stripe Webhook
     */
    async handleWebhook(signature, body) {
        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            throw new Error(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await this.handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }

    async handleCheckoutCompleted(session) {
        if (session.mode === 'subscription') {
            const companyId = session.metadata.company_id;
            const tierName = session.metadata.tier_name;
            const subscriptionId = session.subscription;

            await Company.update({
                subscription_tier: tierName,
                stripe_subscription_id: subscriptionId,
                status: 'active',
                billing_cycle: session.metadata.interval
            }, { where: { id: companyId } });
        }
    }

    async handleInvoicePaymentSucceeded(invoice) {
        const customerId = invoice.customer;
        const company = await Company.findOne({ where: { stripe_customer_id: customerId } });

        if (company) {
            // Record Invoice locally
            await BillingInvoice.create({
                company_id: company.id,
                stripe_invoice_id: invoice.id,
                invoice_number: invoice.number,
                period_start: new Date(invoice.lines.data[0].period.start * 1000),
                period_end: new Date(invoice.lines.data[0].period.end * 1000),
                final_amount: invoice.total,
                status: 'paid',
                paid_at: new Date(),
                stripe_hosted_url: invoice.hosted_invoice_url,
                stripe_pdf_url: invoice.invoice_pdf
            });
        }
    }

    async handleSubscriptionUpdated(subscription) {
        // Find company by customer ID
        const company = await Company.findOne({ where: { stripe_customer_id: subscription.customer } });
        if (company) {
            await company.update({
                current_period_end: new Date(subscription.current_period_end * 1000)
            });
        }
    }

    async handleSubscriptionDeleted(subscription) {
        const company = await Company.findOne({ where: { stripe_customer_id: subscription.customer } });
        if (company) {
            await company.update({
                subscription_tier: 'free',
                status: 'active', // Downgrade to free
                stripe_subscription_id: null
            });
        }
    }
}

module.exports = new StripeService();
