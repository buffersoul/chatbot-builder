'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // We need to use raw query for altering enum type
        // transaction: false is required for ALTER TYPE ADD VALUE in some Postgres versions inside transactions block?
        // Actually sequelize migration usually runs in transaction.
        // If it fails, we catch it (e.g. if 'web' already exists)

        try {
            await queryInterface.sequelize.query("ALTER TYPE enum_conversations_platform ADD VALUE 'web';");
        } catch (e) {
            if (e.original && e.original.code === '42710') {
                // duplicate value, ignore
                console.log("Enum value 'web' already exists.");
            } else {
                throw e;
            }
        }
    },

    async down(queryInterface, Sequelize) {
        // Postgres doesn't support removing enum value easily.
        // We can just proceed.
    }
};
