const { sequelize, UsageRecord, PricingTier } = require('../models');
const usageService = require('../services/billing/usageService');

const runTest = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Use a dummy company ID (make sure this exists or user created one)
        // For test, let's just pick the first company found
        const [company] = await sequelize.query('SELECT id, name, subscription_tier FROM companies LIMIT 1', { type: sequelize.QueryTypes.SELECT });

        if (!company) {
            console.log('No company found for testing. Please register a company first.');
            process.exit(0);
        }

        console.log(`Testing with Company: ${company.name} (${company.id}) - Tier: ${company.subscription_tier}`);

        // 1. Check Limits (Should be true if free tier not exceeded)
        const canSend = await usageService.checkLimits(company.id);
        console.log(`Check Limits (Before): ${canSend}`);

        // 2. Track Token Usage (Simulate RAG)
        console.log('Simulating RAG Usage (500 in, 200 out)...');
        await usageService.trackTokens(company.id, 0, 500, 200);

        // 3. Track Message Usage (Simulate FB Message)
        console.log('Simulating Facebook Message...');
        await usageService.trackMessage(company.id, 'facebook');

        // 4. Verify Record
        const today = new Date().toISOString().split('T')[0];
        const record = await UsageRecord.findOne({
            where: { company_id: company.id, record_date: today }
        });

        if (record) {
            console.log('Usage Record Updated:');
            console.log(`- Total Tokens: ${record.total_tokens}`);
            console.log(`- Total Messages: ${record.total_messages}`);
            console.log(`- Facebook Msgs: ${record.messages_facebook}`);
        } else {
            console.error('FAILED: No usage record found!');
        }

        // 5. Get Stats
        const stats = await usageService.getUsageStats(company.id);
        console.log('Final Stats:', stats);

        process.exit(0);
    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

runTest();
