'use strict';

require('dotenv').config();

const app = require('./app');
const env = require('../config/env');
const { sequelize } = require('../models');
const { logger } = require('./utils/logger');

const PORT = env.port;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`Meridian Health API listening on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        try {
          await sequelize.close();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown', { message: err.message });
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { message: error.message });
    process.exit(1);
  }
}

startServer();
