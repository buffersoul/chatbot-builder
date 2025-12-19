const { sequelize, PricingTier } = require('../models');

const seedPricing = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const tiers = [
            {
                tier_name: 'free',
                display_name: 'Free',
                monthly_base_price: 0,
                annual_base_price: 0,
                included_messages: 100,
                included_tokens: 50000,
                max_users: 1,
                max_meta_connections: 0,
                max_documents: 5,
                features: ['basic_chat', 'document_upload']
            },
            {
                tier_name: 'starter',
                display_name: 'Starter',
                monthly_base_price: 2900, // $29.00
                annual_base_price: 29000,
                included_messages: 1000,
                included_tokens: 500000,
                max_users: 3,
                max_meta_connections: 1,
                max_documents: 20,
                features: ['basic_chat', 'document_upload', 'meta_integration']
            },
            {
                tier_name: 'pro',
                display_name: 'Pro',
                monthly_base_price: 9900, // $99.00
                annual_base_price: 99000,
                included_messages: 10000,
                included_tokens: 5000000,
                max_users: 10,
                max_meta_connections: 5,
                max_documents: 100,
                features: ['basic_chat', 'document_upload', 'meta_integration', 'priority_support']
            }
        ];

        for (const tier of tiers) {
            const [record, created] = await PricingTier.findOrCreate({
                where: { tier_name: tier.tier_name },
                defaults: tier
            });
            if (created) {
                console.log(`Created tier: ${tier.display_name}`);
            } else {
                console.log(`Tier exists: ${tier.display_name}`);
            }
        }

        console.log('Pricing tiers seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedPricing();
