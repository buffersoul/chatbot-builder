'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('company_apis', 'parameters_schema', {
      type: Sequelize.JSONB,
      allowNull: true, // Allow null initially
      defaultValue: {}
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('company_apis', 'parameters_schema');
  }
};
