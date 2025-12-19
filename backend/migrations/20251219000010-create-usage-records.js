'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('usage_records', {
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
            record_date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            embedding_tokens: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            llm_input_tokens: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            llm_output_tokens: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_tokens: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            messages_whatsapp: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            messages_facebook: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            messages_instagram: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_messages: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            embedding_cost: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            llm_cost: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            message_cost: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            total_cost: {
                type: Sequelize.INTEGER,
                defaultValue: 0
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

        await queryInterface.addIndex('usage_records', ['company_id']);
        await queryInterface.addIndex('usage_records', ['record_date']);
        await queryInterface.addIndex('usage_records', ['company_id', 'record_date'], { unique: true });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('usage_records');
    }
};
