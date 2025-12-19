'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('invitations', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            token: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('admin', 'agent'),
                defaultValue: 'agent'
            },
            status: {
                type: Sequelize.ENUM('pending', 'accepted', 'expired'),
                defaultValue: 'pending'
            },
            expires_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Index for faster token lookups
        await queryInterface.addIndex('invitations', ['token']);
        await queryInterface.addIndex('invitations', ['company_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('invitations');
    }
};
