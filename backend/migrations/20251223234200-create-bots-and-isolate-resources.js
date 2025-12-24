'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Create Bots table
        await queryInterface.createTable('bots', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
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
            system_prompt: {
                type: Sequelize.TEXT
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

        // 2. Add bot_id to documents
        await queryInterface.addColumn('documents', 'bot_id', {
            type: Sequelize.UUID,
            allowNull: true, // Allow null initially for migration safety if there are orphaned docs
            references: {
                model: 'bots',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // 3. Add bot_id to company_apis
        await queryInterface.addColumn('company_apis', 'bot_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'bots',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // 4. Add bot_id to conversations
        await queryInterface.addColumn('conversations', 'bot_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'bots',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('conversations', 'bot_id');
        await queryInterface.removeColumn('company_apis', 'bot_id');
        await queryInterface.removeColumn('documents', 'bot_id');
        await queryInterface.dropTable('bots');
    }
};
