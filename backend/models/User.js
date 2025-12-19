'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
            User.hasMany(models.RefreshToken, { foreignKey: 'user_id', as: 'refresh_tokens' });
            User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });
        }
    }
    User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        role: {
            type: DataTypes.ENUM('owner', 'admin', 'agent'),
            defaultValue: 'agent'
        },
        is_email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        email_verification_token: DataTypes.STRING,
        email_verification_expires: DataTypes.DATE,
        last_login_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true
    });
    return User;
};
