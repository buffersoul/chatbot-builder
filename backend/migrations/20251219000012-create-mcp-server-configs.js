'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('mcp_server_configs', {
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
            transport: {
                type: Sequelize.ENUM('stdio', 'http', 'sse'),
                defaultValue: 'stdio'
            },
            command: {
                type: Sequelize.STRING
            },
            args: {
                type: Sequelize.JSONB
            },
            endpoint: {
                type: Sequelize.STRING
            },
            auth_config: {
                type: Sequelize.TEXT
            },
            capabilities: {
                type: Sequelize.JSONB
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            last_connected_at: {
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

        await queryInterface.addIndex('mcp_server_configs', ['company_id']);
        await queryInterface.addIndex('mcp_server_configs', ['is_active']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('mcp_server_configs');
    }
};
