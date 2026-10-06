'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_billing_statements_status AS ENUM ('open', 'paid', 'partial');
    `);

    await queryInterface.createTable('billing_statements', {
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
      statement_date: { type: Sequelize.DATEONLY, allowNull: false },
      visit_description: { type: Sequelize.STRING, allowNull: false },
      amount_owed: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: 'enum_billing_statements_status',
        allowNull: false,
        defaultValue: 'open',
      },
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

    await queryInterface.createTable('statement_lines', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      statement_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'billing_statements', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      service: { type: Sequelize.STRING, allowNull: false },
      billed: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      insurance: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      owed: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
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

    await queryInterface.addIndex('billing_statements', ['patient_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('statement_lines');
    await queryInterface.dropTable('billing_statements');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_billing_statements_status;');
  },
};
