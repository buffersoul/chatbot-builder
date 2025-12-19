'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('companies', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            billing_email: {
                type: Sequelize.STRING
            },
            industry: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.ENUM('active', 'trial', 'suspended', 'past_due'),
                defaultValue: 'trial'
            },
            subscription_tier: {
                type: Sequelize.STRING,
                defaultValue: 'free'
            },
            billing_cycle: {
                type: Sequelize.ENUM('monthly', 'annual'),
                defaultValue: 'monthly'
            },
            stripe_customer_id: {
                type: Sequelize.STRING,
                unique: true
            },
            stripe_subscription_id: {
                type: Sequelize.STRING
            },
            stripe_payment_method_id: {
                type: Sequelize.STRING
            },
            monthly_message_limit: {
                type: Sequelize.INTEGER
            },
            monthly_token_limit: {
                type: Sequelize.INTEGER
            },
            current_period_start: {
                type: Sequelize.DATE
            },
            current_period_end: {
                type: Sequelize.DATE
            },
            chatbot_status: {
                type: Sequelize.ENUM('active', 'paused'),
                defaultValue: 'paused'
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

        await queryInterface.addIndex('companies', ['email']);
        await queryInterface.addIndex('companies', ['stripe_customer_id']);
        await queryInterface.addIndex('companies', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('companies');
    }
};
