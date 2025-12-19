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
            primaryKey: true
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: DataTypes.TEXT,
        is_encrypted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'MetaAsset',
        tableName: 'meta_assets',
        underscored: true
    });
    return MetaAsset;
};
