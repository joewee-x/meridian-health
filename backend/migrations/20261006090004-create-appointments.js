'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_appointments_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
      CREATE TYPE enum_appointments_visit_type AS ENUM ('telehealth', 'in_person');
    `);

    await queryInterface.createTable('appointments', {
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
      provider_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      start_at: { type: Sequelize.DATE, allowNull: false },
      end_at: { type: Sequelize.DATE, allowNull: false },
      status: {
        type: 'enum_appointments_status',
        allowNull: false,
        defaultValue: 'scheduled',
      },
      visit_type: {
        type: 'enum_appointments_visit_type',
        allowNull: false,
      },
      reason: { type: Sequelize.STRING, allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
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

    await queryInterface.addIndex('appointments', ['provider_id', 'start_at']);
    await queryInterface.addIndex('appointments', ['patient_id', 'start_at']);
    await queryInterface.addIndex('appointments', ['status']);

    await queryInterface.sequelize.query(`
      ALTER TABLE appointments
      ADD CONSTRAINT appointments_end_after_start
      CHECK (end_at > start_at);
    `);

    // Exclusion constraint prevents overlapping scheduled appointments for the same provider.
    // Sequelize cannot express GiST exclusion constraints via the queryInterface DSL.
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS btree_gist;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE appointments
      ADD CONSTRAINT appointments_no_provider_overlap
      EXCLUDE USING gist (
        provider_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      )
      WHERE (status = 'scheduled');
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_no_provider_overlap;
      ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_end_after_start;
    `);
    await queryInterface.dropTable('appointments');
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_appointments_status;
      DROP TYPE IF EXISTS enum_appointments_visit_type;
    `);
  },
};
