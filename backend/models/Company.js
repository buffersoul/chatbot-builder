'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Company extends Model {
        static associate(models) {
            Company.hasMany(models.User, { foreignKey: 'company_id', as: 'users' });
            Company.hasMany(models.CompanyApi, { foreignKey: 'company_id', as: 'apis' });
            Company.hasMany(models.MetaAsset, { foreignKey: 'company_id', as: 'meta_assets' });

            // Billing Associations
            Company.belongsTo(models.PricingTier, { foreignKey: 'subscription_tier', targetKey: 'tier_name', as: 'current_tier' });
            Company.hasMany(models.UsageRecord, { foreignKey: 'company_id', as: 'usage_records' });
            Company.hasMany(models.BillingInvoice, { foreignKey: 'company_id', as: 'invoices' });
            Company.hasMany(models.Document, { foreignKey: 'company_id', as: 'documents' });
            Company.hasMany(models.Conversation, { foreignKey: 'company_id', as: 'conversations' });
        }
    }
    Company.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        billing_email: DataTypes.STRING,
        industry: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM('active', 'trial', 'suspended', 'past_due'),
            defaultValue: 'trial'
        },
        subscription_tier: {
            type: DataTypes.STRING,
            defaultValue: 'free'
        },
        billing_cycle: {
            type: DataTypes.ENUM('monthly', 'annual'),
            defaultValue: 'monthly'
        },
        stripe_customer_id: {
            type: DataTypes.STRING,
            unique: true
        },
        stripe_subscription_id: DataTypes.STRING,
        stripe_payment_method_id: DataTypes.STRING,
        monthly_message_limit: DataTypes.INTEGER,
        monthly_token_limit: DataTypes.INTEGER,
        current_period_start: DataTypes.DATE,
        current_period_end: DataTypes.DATE,
        chatbot_status: {
            type: DataTypes.ENUM('active', 'paused'),
            defaultValue: 'paused'
        }
    }, {
        sequelize,
        modelName: 'Company',
        tableName: 'companies',
        underscored: true
    });
    return Company;
};
