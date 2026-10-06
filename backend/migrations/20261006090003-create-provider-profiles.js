'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_provider_profiles_status AS ENUM ('pending', 'active', 'inactive');
    `);

    await queryInterface.createTable('provider_profiles', {
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
      specialty: { type: Sequelize.STRING, allowNull: false },
      specialty_slug: { type: Sequelize.STRING, allowNull: true },
      credentials: { type: Sequelize.STRING, allowNull: true },
      npi: { type: Sequelize.STRING, allowNull: true, unique: true },
      bio: { type: Sequelize.TEXT, allowNull: true },
      education: { type: Sequelize.STRING, allowNull: true },
      experience_years: { type: Sequelize.INTEGER, allowNull: true },
      rating: { type: Sequelize.DECIMAL(3, 2), allowNull: true },
      reviews_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      languages: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: ['English'],
      },
      location: { type: Sequelize.STRING, allowNull: true },
      telehealth: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      in_person: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      accepting_new: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      status: {
        type: 'enum_provider_profiles_status',
        allowNull: false,
        defaultValue: 'pending',
      },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      submitted_at: { type: Sequelize.DATE, allowNull: true },
      avatar_color: { type: Sequelize.STRING, allowNull: true },
      title: { type: Sequelize.STRING, allowNull: true },
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

    await queryInterface.addIndex('provider_profiles', ['status']);
    await queryInterface.addIndex('provider_profiles', ['specialty']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('provider_profiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_provider_profiles_status;');
  },
};
