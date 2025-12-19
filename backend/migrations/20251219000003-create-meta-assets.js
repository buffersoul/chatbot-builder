'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('meta_assets', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
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
            platform: {
                type: Sequelize.ENUM('whatsapp', 'facebook', 'instagram'),
                allowNull: false
            },
            asset_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            asset_name: {
                type: Sequelize.STRING
            },
            access_token_encrypted: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            token_expires_at: {
                type: Sequelize.DATE
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            webhook_verified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            connected_at: {
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

        await queryInterface.addIndex('meta_assets', ['company_id']);
        await queryInterface.addIndex('meta_assets', ['asset_id']);
        await queryInterface.addIndex('meta_assets', ['platform']);
        await queryInterface.addIndex('meta_assets', ['is_active']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('meta_assets');
    }
};
