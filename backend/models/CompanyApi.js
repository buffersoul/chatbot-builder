'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CompanyApi extends Model {
        /**
         * Helper method for defining associations.
         */
        static associate(models) {
            CompanyApi.belongsTo(models.Company, {
                foreignKey: 'company_id',
                onDelete: 'CASCADE'
            });
        }
    }
    CompanyApi.init({
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
        endpoint_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        method: {
            type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE'),
            defaultValue: 'GET'
        },
        headers: DataTypes.JSONB,
        auth_type: {
            type: DataTypes.ENUM('none', 'bearer', 'api_key', 'basic'),
            defaultValue: 'none'
        },
        auth_credentials_encrypted: DataTypes.TEXT,
        timeout_ms: {
            type: DataTypes.INTEGER,
            defaultValue: 10000
        },
        parameters_schema: { // Added via migration
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'CompanyApi',
        tableName: 'company_apis',
        underscored: true
    });
    return CompanyApi;
};
