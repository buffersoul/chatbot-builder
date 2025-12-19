'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Invitation extends Model {
        static associate(models) {
            Invitation.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
        }
    }
    Invitation.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false, // We'll always ask for email to track who is invited
            validate: { isEmail: true }
        },
        role: {
            type: DataTypes.ENUM('admin', 'agent'),
            defaultValue: 'agent'
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted', 'expired'),
            defaultValue: 'pending'
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Invitation',
        tableName: 'invitations',
        underscored: true
    });
    return Invitation;
};
