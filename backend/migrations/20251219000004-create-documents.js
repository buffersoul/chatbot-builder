'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('documents', {
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
            filename: {
                type: Sequelize.STRING,
                allowNull: false
            },
            file_type: {
                type: Sequelize.ENUM('pdf', 'docx', 'txt'),
                allowNull: false
            },
            file_size: {
                type: Sequelize.INTEGER
            },
            firebase_path: {
                type: Sequelize.STRING,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
                defaultValue: 'pending'
            },
            ingestion_started_at: {
                type: Sequelize.DATE
            },
            ingestion_completed_at: {
                type: Sequelize.DATE
            },
            error_message: {
                type: Sequelize.TEXT
            },
            chunk_count: {
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

        await queryInterface.addIndex('documents', ['company_id']);
        await queryInterface.addIndex('documents', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('documents');
    }
};
