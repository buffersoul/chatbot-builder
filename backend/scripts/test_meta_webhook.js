const { sequelize, Company, MetaAsset } = require('../models');
const MessageDispatcher = require('../services/meta/MessageDispatcher');

async function test() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();

        const company = await Company.findOne();
        if (!company) throw new Error("No company found to test with.");

        const pageId = '123456789';
        const senderId = 'visitor_999';

        console.log(`Using Company: ${company.id}`);

        // Ensure fake asset exists
        await MetaAsset.destroy({ where: { asset_id: pageId } });
        await MetaAsset.create({
            company_id: company.id,
            platform: 'facebook',
            asset_id: pageId,
            asset_name: 'Test Page',
            access_token_encrypted: 'fake_token_123',
            is_active: true
        });

        const event = {
            sender: { id: senderId },
            recipient: { id: pageId },
            message: { text: "Hello! checking if meta webhook works." }
        };

        console.log("Dispatching simulated webhook event...");
        await MessageDispatcher.dispatch(event);
        console.log("Dispatch logic completed (Check logs for RAG execution).");

    } catch (e) {
        console.error("Test Failed:", e);
    } finally {
        // await sequelize.close(); // Close might hang if pool active, but good for script
        process.exit(0);
    }
}

test();
