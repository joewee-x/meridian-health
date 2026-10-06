'use strict';

const { BillingStatement, StatementLine, PatientProfile, sequelize } = require('../../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { writeAuditLog } = require('../utils/audit');
const { formatAppointmentDate } = require('../utils/serializers');

function assertPatientAccess(req, patientId) {
  if (req.user.role === 'patient' && patientId !== req.user.id) {
    throw new AppError('Not found', 404, 'NOT_FOUND');
  }
}

const getBillingOverview = asyncHandler(async (req, res) => {
  const patientId = req.user.role === 'patient' ? req.user.id : req.query.patientId;
  if (!patientId) throw new AppError('patientId is required', 400, 'VALIDATION_ERROR');
  assertPatientAccess(req, patientId);

  const profile = await PatientProfile.findOne({ where: { userId: patientId } });
  if (!profile) throw new AppError('Patient not found', 404, 'NOT_FOUND');

  const statements = await BillingStatement.findAll({
    where: { patientId },
    include: [{ model: StatementLine, as: 'Lines' }],
    order: [['statementDate', 'DESC']],
  });

  await writeAuditLog({
    userId: req.user.id,
    action: 'READ',
    entityType: 'Billing',
    entityId: patientId,
    ipAddress: req.ip,
  });

  return ok(res, {
    balance: Number(profile.outstandingBalance),
    statements: statements.map((s) => ({
      id: s.id,
      date: formatAppointmentDate(s.statementDate),
      visit: s.visitDescription,
      amount: Number(s.amountOwed),
      status: s.status,
      lines: (s.Lines || []).map((line) => ({
        service: line.service,
        billed: Number(line.billed),
        insurance: Number(line.insurance),
        owed: Number(line.owed),
      })),
    })),
  });
});

const getStatement = asyncHandler(async (req, res) => {
  const statement = await BillingStatement.findByPk(req.params.id, {
    include: [{ model: StatementLine, as: 'Lines' }],
  });
  if (!statement) throw new AppError('Statement not found', 404, 'NOT_FOUND');
  assertPatientAccess(req, statement.patientId);

  return ok(res, {
    id: statement.id,
    date: formatAppointmentDate(statement.statementDate),
    visit: statement.visitDescription,
    amount: Number(statement.amountOwed),
    lines: (statement.Lines || []).map((line) => ({
      service: line.service,
      billed: Number(line.billed),
      insurance: Number(line.insurance),
      owed: Number(line.owed),
    })),
  });
});

const payBalance = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    throw new AppError('Only patients can pay bills', 403, 'FORBIDDEN');
  }

  const { cardNumber, expiry, cvv } = req.body;
  if (!cardNumber || String(cardNumber).replace(/\D/g, '').length < 12 || !expiry || String(cvv).replace(/\D/g, '').length < 3) {
    throw new AppError(
      'Enter a valid card number, expiry date, and 3-digit security code.',
      400,
      'VALIDATION_ERROR'
    );
  }

  await sequelize.transaction(async (transaction) => {
    const profile = await PatientProfile.findOne({
      where: { userId: req.user.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!profile) throw new AppError('Patient not found', 404, 'NOT_FOUND');

    await profile.update({ outstandingBalance: 0 }, { transaction });
    await BillingStatement.update(
      { status: 'paid', amountOwed: 0 },
      { where: { patientId: req.user.id, status: ['open', 'partial'] }, transaction }
    );
  });

  await writeAuditLog({
    userId: req.user.id,
    action: 'PAYMENT',
    entityType: 'Billing',
    entityId: req.user.id,
    ipAddress: req.ip,
    metadata: { mock: true },
  });

  return ok(res, { success: true, balance: 0 });
});

module.exports = { getBillingOverview, getStatement, payBalance };
