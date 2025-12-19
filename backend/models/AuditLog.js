'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AuditLog extends Model {
        static associate(models) {
            AuditLog.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
            AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        }
    }
    AuditLog.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        user_id: DataTypes.UUID,
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        resource_type: DataTypes.STRING,
        resource_id: DataTypes.UUID,
        metadata: DataTypes.JSONB,
        ip_address: DataTypes.STRING,
        user_agent: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        underscored: true
    });
    return AuditLog;
};
