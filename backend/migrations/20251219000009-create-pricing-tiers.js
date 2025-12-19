'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('pricing_tiers', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            tier_name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            display_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            stripe_price_id: {
                type: Sequelize.STRING
            },
            stripe_annual_price_id: {
                type: Sequelize.STRING
            },
            monthly_base_price: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            annual_base_price: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            included_messages: {
                type: Sequelize.INTEGER
            },
            included_tokens: {
                type: Sequelize.INTEGER
            },
            price_per_1k_tokens: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            price_per_message: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            max_users: {
                type: Sequelize.INTEGER
            },
            max_meta_connections: {
                type: Sequelize.INTEGER
            },
            max_documents: {
                type: Sequelize.INTEGER
            },
            features: {
                type: Sequelize.JSONB
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('pricing_tiers', ['tier_name']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('pricing_tiers');
    }
};
