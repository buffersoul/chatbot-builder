'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Bot extends Model {
        static associate(models) {
            Bot.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
            Bot.hasMany(models.Document, { foreignKey: 'bot_id', as: 'documents' });
            Bot.hasMany(models.CompanyApi, { foreignKey: 'bot_id', as: 'apis' });
            Bot.hasMany(models.Conversation, { foreignKey: 'bot_id', as: 'conversations' });
        }
    }
    Bot.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        system_prompt: DataTypes.TEXT,
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Bot',
        tableName: 'bots',
        underscored: true
    });
    return Bot;
};
