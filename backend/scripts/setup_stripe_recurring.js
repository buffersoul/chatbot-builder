require('dotenv').config();
const Stripe = require('stripe');
const { sequelize, PricingTier } = require('../models');

// Use the key from env
if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is missing from .env");
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Product IDs created via MCP
const STARTER_PROD_ID = 'prod_TdHoHGgZPl2Hqi';
const PRO_PROD_ID = 'prod_TdHoWCDAzeHpW0';

const setup = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Create Starter Annual (Monthly was one-time, so create new Monthly too)
        console.log('Creating Starter Recurring Prices...');
        const starterMonthly = await stripe.prices.create({
            product: STARTER_PROD_ID,
            unit_amount: 2900,
            currency: 'usd',
            recurring: { interval: 'month' }
        });
        const starterAnnual = await stripe.prices.create({
            product: STARTER_PROD_ID,
            unit_amount: 29000,
            currency: 'usd',
            recurring: { interval: 'year' }
        });

        // 2. Create Pro Recurring
        console.log('Creating Pro Recurring Prices...');
        const proMonthly = await stripe.prices.create({
            product: PRO_PROD_ID,
            unit_amount: 9900,
            currency: 'usd',
            recurring: { interval: 'month' }
        });
        const proAnnual = await stripe.prices.create({
            product: PRO_PROD_ID,
            unit_amount: 99000,
            currency: 'usd',
            recurring: { interval: 'year' }
        });

        // 3. Update Database
        console.log('Updating Database...');

        await PricingTier.update({
            stripe_price_id: starterMonthly.id,
            stripe_annual_price_id: starterAnnual.id
        }, { where: { tier_name: 'starter' } });

        await PricingTier.update({
            stripe_price_id: proMonthly.id,
            stripe_annual_price_id: proAnnual.id
        }, { where: { tier_name: 'pro' } });

        console.log('Success! IDs updated.');
        console.log('Starter:', starterMonthly.id, starterAnnual.id);
        console.log('Pro:', proMonthly.id, proAnnual.id);

        process.exit(0);

    } catch (error) {
        console.error('Setup failed:', error.message);
        process.exit(1);
    }
};

setup();
