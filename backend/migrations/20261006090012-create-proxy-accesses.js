'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_proxy_accesses_access_level AS ENUM ('limited', 'full');
      CREATE TYPE enum_proxy_accesses_status AS ENUM ('active', 'revoked', 'pending');
    `);

    await queryInterface.createTable('proxy_accesses', {
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
      proxy_name: { type: Sequelize.STRING, allowNull: false },
      access_level: {
        type: 'enum_proxy_accesses_access_level',
        allowNull: false,
        defaultValue: 'limited',
      },
      status: {
        type: 'enum_proxy_accesses_status',
        allowNull: false,
        defaultValue: 'pending',
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

    await queryInterface.addIndex('proxy_accesses', ['patient_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('proxy_accesses');
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_proxy_accesses_access_level;
      DROP TYPE IF EXISTS enum_proxy_accesses_status;
    `);
  },
};
