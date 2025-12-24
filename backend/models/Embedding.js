'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Embedding extends Model {
        static associate(models) {
            Embedding.belongsTo(models.Document, { foreignKey: 'document_id', as: 'document' });
            Embedding.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
            Embedding.belongsTo(models.Bot, { foreignKey: 'bot_id', as: 'bot' });
        }
    }
    Embedding.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        document_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        bot_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        chunk_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        chunk_index: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        embedding: {
            type: DataTypes.ARRAY(DataTypes.FLOAT), // Maps to pgvector column
            allowNull: false
        },
        metadata: DataTypes.JSONB
    }, {
        sequelize,
        modelName: 'Embedding',
        tableName: 'embeddings',
        underscored: true,
        indexes: [
            // IVFFLAT index for approximate nearest neighbor search
            // Note: This needs to be created via migration or raw query carefully as it requires data
            // For now we rely on the migration index.
        ]
    });
    return Embedding;
};
