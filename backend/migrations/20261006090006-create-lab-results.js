'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_lab_results_status AS ENUM ('normal', 'attention', 'critical');
    `);

    await queryInterface.createTable('lab_results', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ordered_by_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      result_date: { type: Sequelize.DATEONLY, allowNull: false },
      value: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: 'enum_lab_results_status',
        allowNull: false,
        defaultValue: 'normal',
      },
      explanation: { type: Sequelize.TEXT, allowNull: true },
      range_text: { type: Sequelize.STRING, allowNull: true },
      education_url: { type: Sequelize.STRING, allowNull: true },
      is_new: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('lab_results', ['patient_id', 'result_date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lab_results');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_lab_results_status;');
  },
};
