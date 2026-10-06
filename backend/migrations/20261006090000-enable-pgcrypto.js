'use strict';

/** Enable pgcrypto for gen_random_uuid if needed */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  },

  async down() {
    // Keep extension; dropping may affect other DBs on shared servers.
  },
};
