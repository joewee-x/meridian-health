'use strict';

const {
  VisitSummary,
  LabResult,
  Medication,
  Immunization,
  User,
  ProviderProfile,
} = require('../../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { writeAuditLog } = require('../utils/audit');
const { formatAppointmentDate } = require('../utils/serializers');

function patientScope(req) {
  if (req.user.role === 'patient') return req.user.id;
  if (req.query.patientId) return req.query.patientId;
  if (req.params.patientId) return req.params.patientId;
  return req.user.id;
}

function assertPatientAccess(req, patientId) {
  if (req.user.role === 'patient' && patientId !== req.user.id) {
    throw new AppError('Not found', 404, 'NOT_FOUND');
  }
}

const listVisitSummaries = asyncHandler(async (req, res) => {
  const patientId = patientScope(req);
  assertPatientAccess(req, patientId);

  const rows = await VisitSummary.findAll({
    where: { patientId },
    include: [
      {
        model: User,
        as: 'Provider',
        attributes: ['id', 'firstName', 'lastName'],
        include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
      },
    ],
    order: [['visitDate', 'DESC']],
  });

  await writeAuditLog({
    userId: req.user.id,
    action: 'LIST',
    entityType: 'VisitSummary',
    entityId: patientId,
    ipAddress: req.ip,
  });

  return ok(
    res,
    rows.map((row) => ({
      id: row.id,
      date: formatAppointmentDate(row.visitDate),
      provider: row.Provider
        ? `Dr. ${row.Provider.firstName} ${row.Provider.lastName}${row.Provider.ProviderProfile?.credentials ? `, ${row.Provider.ProviderProfile.credentials}` : ''}`
        : 'Provider',
      reason: row.reason,
      summary: row.summary,
      followUp: row.followUp,
    }))
  );
});

const getVisitSummary = asyncHandler(async (req, res) => {
  const row = await VisitSummary.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'Provider',
        attributes: ['id', 'firstName', 'lastName'],
        include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
      },
    ],
  });
  if (!row) throw new AppError('Visit summary not found', 404, 'NOT_FOUND');
  assertPatientAccess(req, row.patientId);

  await writeAuditLog({
    userId: req.user.id,
    action: 'READ',
    entityType: 'VisitSummary',
    entityId: row.id,
    ipAddress: req.ip,
  });

  return ok(res, {
    id: row.id,
    date: formatAppointmentDate(row.visitDate),
    provider: row.Provider
      ? `Dr. ${row.Provider.firstName} ${row.Provider.lastName}${row.Provider.ProviderProfile?.credentials ? `, ${row.Provider.ProviderProfile.credentials}` : ''}`
      : 'Provider',
    reason: row.reason,
    summary: row.summary,
    followUp: row.followUp,
  });
});

const listLabResults = asyncHandler(async (req, res) => {
  const patientId = patientScope(req);
  assertPatientAccess(req, patientId);

  const rows = await LabResult.findAll({
    where: { patientId },
    order: [['resultDate', 'DESC']],
  });

  await writeAuditLog({
    userId: req.user.id,
    action: 'LIST',
    entityType: 'LabResult',
    entityId: patientId,
    ipAddress: req.ip,
  });

  return ok(
    res,
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      date: formatAppointmentDate(row.resultDate),
      value: row.value,
      status: row.status,
      explanation: row.explanation,
      range: row.rangeText,
      education: row.educationUrl,
      isNew: row.isNew,
    }))
  );
});

const listMedications = asyncHandler(async (req, res) => {
  const patientId = patientScope(req);
  assertPatientAccess(req, patientId);

  const rows = await Medication.findAll({
    where: { patientId, isActive: true },
    include: [
      {
        model: User,
        as: 'PrescribedBy',
        attributes: ['id', 'firstName', 'lastName'],
        include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
      },
    ],
    order: [['name', 'ASC']],
  });

  return ok(
    res,
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      dosage: row.dosage,
      provider: row.PrescribedBy
        ? `Dr. ${row.PrescribedBy.firstName} ${row.PrescribedBy.lastName}${row.PrescribedBy.ProviderProfile?.credentials ? `, ${row.PrescribedBy.ProviderProfile.credentials}` : ''}`
        : 'Provider',
      refillStatus: row.refillStatus === 'none' ? null : row.refillStatus === 'pending' ? 'Pending' : row.refillStatus,
    }))
  );
});

const requestRefill = asyncHandler(async (req, res) => {
  const med = await Medication.findByPk(req.params.id);
  if (!med) throw new AppError('Medication not found', 404, 'NOT_FOUND');
  assertPatientAccess(req, med.patientId);

  await med.update({ refillStatus: 'pending' });

  await writeAuditLog({
    userId: req.user.id,
    action: 'REFILL_REQUEST',
    entityType: 'Medication',
    entityId: med.id,
    ipAddress: req.ip,
  });

  return ok(res, { id: med.id, refillStatus: 'Pending' });
});

const listImmunizations = asyncHandler(async (req, res) => {
  const patientId = patientScope(req);
  assertPatientAccess(req, patientId);

  const rows = await Immunization.findAll({
    where: { patientId },
    order: [['administeredOn', 'DESC']],
  });

  return ok(
    res,
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      date: formatAppointmentDate(row.administeredOn),
    }))
  );
});

module.exports = {
  listVisitSummaries,
  getVisitSummary,
  listLabResults,
  listMedications,
  requestRefill,
  listImmunizations,
};
