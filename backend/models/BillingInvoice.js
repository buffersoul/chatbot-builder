'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BillingInvoice extends Model {
        static associate(models) {
            BillingInvoice.belongsTo(models.Company, { foreignKey: 'company_id' });
        }
    }

    BillingInvoice.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        stripe_invoice_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        invoice_number: DataTypes.STRING,
        period_start: {
            type: DataTypes.DATE,
            allowNull: false
        },
        period_end: {
            type: DataTypes.DATE,
            allowNull: false
        },
        total_tokens: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_messages: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        base_subscription_cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        usage_cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        final_amount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('draft', 'open', 'paid', 'void', 'uncollectible'),
            defaultValue: 'draft'
        },
        due_date: DataTypes.DATE,
        paid_at: DataTypes.DATE,
        line_items: DataTypes.JSONB,
        stripe_hosted_url: DataTypes.STRING,
        stripe_pdf_url: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'BillingInvoice',
        tableName: 'billing_invoices',
        underscored: true
    });

    return BillingInvoice;
};
