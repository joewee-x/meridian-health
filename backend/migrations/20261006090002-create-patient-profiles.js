'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_patient_profiles_status AS ENUM ('active', 'inactive');
    `);

    await queryInterface.createTable('patient_profiles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      primary_doctor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      insurance_provider: { type: Sequelize.STRING, allowNull: true },
      insurance_member_id: { type: Sequelize.STRING, allowNull: true },
      insurance_group_number: { type: Sequelize.STRING, allowNull: true },
      notify_appointment: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      notify_messages: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      notify_results: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      notify_billing: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      notify_email: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      notify_sms: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      notify_push: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      outstanding_balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: 'enum_patient_profiles_status',
        allowNull: false,
        defaultValue: 'active',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('patient_profiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_patient_profiles_status;');
  },
};
