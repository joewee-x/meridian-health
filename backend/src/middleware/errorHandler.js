'use strict';

const {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
  ExclusionConstraintError,
  DatabaseError,
} = require('sequelize');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');
const env = require('../../config/env');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message || 'Unhandled error', {
    code: err.code,
    name: err.name,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A record with that value already exists',
        details: err.errors?.map((e) => ({ path: [e.path], message: e.message })),
      },
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.map(({ path, message }) => ({ path: [path], message })),
      },
    });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      error: {
        code: 'INVALID_REFERENCE',
        message: 'Referenced resource does not exist',
      },
    });
  }

  if (err instanceof ExclusionConstraintError || err?.original?.constraint === 'appointments_no_provider_overlap') {
    return res.status(409).json({
      error: {
        code: 'SCHEDULING_CONFLICT',
        message: 'This provider is already booked for the selected time',
      },
    });
  }

  if (err instanceof DatabaseError && /appointments_no_provider_overlap/.test(err.message)) {
    return res.status(409).json({
      error: {
        code: 'SCHEDULING_CONFLICT',
        message: 'This provider is already booked for the selected time',
      },
    });
  }

  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isProduction ? 'Internal server error' : err.message || 'Internal server error',
    },
  });
};

module.exports = errorHandler;
