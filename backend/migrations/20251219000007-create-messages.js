'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('messages', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            conversation_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'conversations',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            message_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            direction: {
                type: Sequelize.ENUM('inbound', 'outbound'),
                allowNull: false
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            message_type: {
                type: Sequelize.ENUM('text', 'image', 'video', 'audio', 'document'),
                defaultValue: 'text'
            },
            rag_context_used: {
                type: Sequelize.JSONB
            },
            api_data_used: {
                type: Sequelize.JSONB
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

        await queryInterface.addIndex('messages', ['conversation_id']);
        await queryInterface.addIndex('messages', ['message_id']);
        await queryInterface.addIndex('messages', ['direction']);
        await queryInterface.addIndex('messages', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('messages');
    }
};
