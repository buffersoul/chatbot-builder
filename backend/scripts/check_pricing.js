const { sequelize, PricingTier } = require('../models');

const checkPricing = async () => {
    try {
        await sequelize.authenticate();
        const tiers = await PricingTier.findAll();
        console.log(JSON.stringify(tiers, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkPricing();
