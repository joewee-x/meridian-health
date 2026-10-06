'use strict';

const { AuditLog } = require('../../models');
const { logger } = require('./logger');

async function writeAuditLog({
  userId = null,
  action,
  entityType,
  entityId = null,
  ipAddress = null,
  metadata = null,
}) {
  try {
    await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      ipAddress,
      metadata,
    });
  } catch (err) {
    logger.error('Failed to write audit log', { message: err.message });
  }
}

module.exports = { writeAuditLog };
