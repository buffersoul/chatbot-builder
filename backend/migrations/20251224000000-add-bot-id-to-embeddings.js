'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('embeddings', 'bot_id', {
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
        await queryInterface.removeColumn('embeddings', 'bot_id');
    }
};
