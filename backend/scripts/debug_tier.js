const { Company } = require('../models');

async function checkTier() {
    try {
        const companies = await Company.findAll();
        console.log('--- Companies Status ---');
        companies.forEach(c => {
            console.log(`Email: ${c.email} | Tier: ${c.subscription_tier} | Status: ${c.status} | Cycle: ${c.billing_cycle}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTier();
