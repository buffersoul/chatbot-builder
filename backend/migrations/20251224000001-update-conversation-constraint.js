'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Remove the old index/constraint
        try {
            await queryInterface.removeIndex('conversations', ['visitor_id', 'company_id', 'platform']);
        } catch (error) {
            console.warn('Old index might not exist or already removed:', error.message);
        }

        // 2. Add the new unique index including bot_id
        await queryInterface.addIndex(
            'conversations',
            ['visitor_id', 'company_id', 'platform', 'bot_id'],
            {
                unique: true,
                name: 'conversations_visitor_bot_platform_unique'
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert changes
        await queryInterface.removeIndex('conversations', 'conversations_visitor_bot_platform_unique');
        await queryInterface.addIndex('conversations', ['visitor_id', 'company_id', 'platform'], { unique: true });
    }
};
