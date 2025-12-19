'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('company_apis', {
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
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT
            },
            endpoint_url: {
                type: Sequelize.STRING,
                allowNull: false
            },
            method: {
                type: Sequelize.ENUM('GET', 'POST', 'PUT', 'DELETE'),
                defaultValue: 'GET'
            },
            headers: {
                type: Sequelize.JSONB
            },
            auth_type: {
                type: Sequelize.ENUM('none', 'bearer', 'api_key', 'basic'),
                defaultValue: 'none'
            },
            auth_credentials_encrypted: {
                type: Sequelize.TEXT
            },
            timeout_ms: {
                type: Sequelize.INTEGER,
                defaultValue: 10000
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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

        await queryInterface.addIndex('company_apis', ['company_id']);
        await queryInterface.addIndex('company_apis', ['is_active']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('company_apis');
    }
};
