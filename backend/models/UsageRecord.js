'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UsageRecord extends Model {
        static associate(models) {
            UsageRecord.belongsTo(models.Company, { foreignKey: 'company_id' });
        }
    }

    UsageRecord.init({
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
        record_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        embedding_tokens: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        llm_input_tokens: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        llm_output_tokens: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_tokens: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        messages_whatsapp: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        messages_facebook: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        messages_instagram: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_messages: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        embedding_cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        llm_cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        message_cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'UsageRecord',
        tableName: 'usage_records',
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['company_id', 'record_date']
            }
        ]
    });

    return UsageRecord;
};
