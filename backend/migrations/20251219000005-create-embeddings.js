'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create pgvector extension
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');

        await queryInterface.createTable('embeddings', {
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
            document_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'documents',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            chunk_text: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            chunk_index: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            embedding: {
                type: 'vector(768)', // Direct usage if supported, or handled via raw query
                allowNull: false
            },
            metadata: {
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

        await queryInterface.addIndex('embeddings', ['company_id']);
        await queryInterface.addIndex('embeddings', ['document_id']);

        // Create vector index
        await queryInterface.sequelize.query('CREATE INDEX ON "embeddings" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('embeddings');
    }
};
