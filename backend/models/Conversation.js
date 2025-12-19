'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Conversation extends Model {
        static associate(models) {
            Conversation.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
            Conversation.hasMany(models.Message, { foreignKey: 'conversation_id', as: 'messages' });
        }
    }
    Conversation.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        visitor_id: DataTypes.STRING,
        status: {
            type: DataTypes.ENUM('active', 'closed', 'archived'),
            defaultValue: 'active'
        },
        platform: {
            type: DataTypes.ENUM('whatsapp', 'facebook', 'instagram', 'web'),
            defaultValue: 'web',
            allowNull: false
        },
        metadata: DataTypes.JSONB
    }, {
        sequelize,
        modelName: 'Conversation',
        tableName: 'conversations',
        underscored: true
    });
    return Conversation;
};
