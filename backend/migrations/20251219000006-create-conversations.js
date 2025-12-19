'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('conversations', {
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
            visitor_id: {
                type: Sequelize.STRING,
                allowNull: false
            },
            platform: {
                type: Sequelize.ENUM('whatsapp', 'facebook', 'instagram', 'web'),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('active', 'resolved', 'archived'),
                defaultValue: 'active'
            },
            last_message_at: {
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

        await queryInterface.addIndex('conversations', ['company_id']);
        await queryInterface.addIndex('conversations', ['visitor_id', 'company_id', 'platform'], { unique: true });
        await queryInterface.addIndex('conversations', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('conversations');
    }
};
