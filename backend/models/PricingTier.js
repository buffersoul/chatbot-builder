'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PricingTier extends Model {
        static associate(models) {
            // Associations can be defined here
            // Example: models.Company.belongsTo(PricingTier) if we add current_tier_id to Company
        }
    }

    PricingTier.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        tier_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        display_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        stripe_price_id: DataTypes.STRING,
        stripe_annual_price_id: DataTypes.STRING,
        monthly_base_price: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        annual_base_price: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        included_messages: DataTypes.INTEGER,
        included_tokens: DataTypes.INTEGER,
        price_per_1k_tokens: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        price_per_message: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        max_users: DataTypes.INTEGER,
        max_meta_connections: DataTypes.INTEGER,
        max_documents: DataTypes.INTEGER,
        features: DataTypes.JSONB
    }, {
        sequelize,
        modelName: 'PricingTier',
        tableName: 'pricing_tiers',
        underscored: true
    });

    return PricingTier;
};
