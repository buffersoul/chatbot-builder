'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MetaAsset extends Model {
        static associate(models) {
            MetaAsset.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
        }
    }
    MetaAsset.init({
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
        platform: {
            type: DataTypes.ENUM('whatsapp', 'facebook', 'instagram'),
            allowNull: false
        },
        asset_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        asset_name: {
            type: DataTypes.STRING
        },
        access_token_encrypted: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        token_expires_at: {
            type: DataTypes.DATE
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        webhook_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        connected_at: {
            type: DataTypes.DATE
        }
    }, {
        sequelize,
        modelName: 'MetaAsset',
        tableName: 'meta_assets',
        underscored: true
    });
    return MetaAsset;
};
