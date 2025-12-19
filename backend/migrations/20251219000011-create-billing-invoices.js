'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('billing_invoices', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            stripe_invoice_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            invoice_number: {
                type: Sequelize.STRING
            },
            period_start: {
                type: Sequelize.DATE,
                allowNull: false
            },
            period_end: {
                type: Sequelize.DATE,
                allowNull: false
            },
            total_tokens: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_messages: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            base_subscription_cost: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            usage_cost: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_cost: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            final_amount: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            status: {
                type: Sequelize.ENUM('draft', 'open', 'paid', 'void', 'uncollectible'),
                defaultValue: 'draft'
            },
            due_date: {
                type: Sequelize.DATE
            },
            paid_at: {
                type: Sequelize.DATE
            },
            line_items: {
                type: Sequelize.JSONB
            },
            stripe_hosted_url: {
                type: Sequelize.STRING
            },
            stripe_pdf_url: {
                type: Sequelize.STRING
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

        await queryInterface.addIndex('billing_invoices', ['company_id']);
        await queryInterface.addIndex('billing_invoices', ['stripe_invoice_id']);
        await queryInterface.addIndex('billing_invoices', ['status']);
        await queryInterface.addIndex('billing_invoices', ['period_end']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('billing_invoices');
    }
};
