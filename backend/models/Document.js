'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Document extends Model {
        static associate(models) {
            Document.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
            Document.belongsTo(models.Bot, { foreignKey: 'bot_id', as: 'bot' });
            Document.hasMany(models.Embedding, { foreignKey: 'document_id', as: 'embeddings' });
        }
    }
    Document.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        bot_id: {
            type: DataTypes.UUID,
            allowNull: true // Will be enforced in logic or later migration
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file_type: {
            type: DataTypes.ENUM('pdf', 'docx', 'txt'),
            allowNull: false
        },
        file_size: DataTypes.INTEGER,
        firebase_path: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
            defaultValue: 'pending'
        },
        ingestion_started_at: DataTypes.DATE,
        ingestion_completed_at: DataTypes.DATE,
        error_message: DataTypes.TEXT,
        chunk_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'Document',
        tableName: 'documents',
        underscored: true
    });
    return Document;
};
