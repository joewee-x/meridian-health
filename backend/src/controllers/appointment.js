'use strict';

const { Op } = require('sequelize');
const {
  Appointment,
  User,
  ProviderProfile,
  sequelize,
} = require('../../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const { serializeAppointment } = require('../utils/serializers');
const { writeAuditLog } = require('../utils/audit');

const providerInclude = {
  model: User,
  as: 'Provider',
  attributes: ['id', 'firstName', 'lastName', 'email'],
  include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
};

const patientInclude = {
  model: User,
  as: 'Patient',
  attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
};

function normalizeVisitType(value) {
  if (!value) return value;
  const v = String(value).toLowerCase();
  if (v === 'telehealth') return 'telehealth';
  if (v === 'in person' || v === 'in_person') return 'in_person';
  return value;
}

function defaultEndAt(startAt) {
  return new Date(new Date(startAt).getTime() + 30 * 60 * 1000);
}

function buildListWhere(req) {
  const where = {};
  const { status, providerId, patientId, from, to } = req.query;

  if (req.user.role === 'patient') {
    where.patientId = req.user.id;
  } else if (req.user.role === 'provider') {
    where.providerId = req.user.id;
  } else {
    if (patientId) where.patientId = patientId;
    if (providerId) where.providerId = providerId;
  }

  if (status === 'upcoming') {
    where.status = 'scheduled';
    where.startAt = { [Op.gte]: new Date() };
  } else if (status === 'past') {
    where[Op.or] = [
      { status: 'completed' },
      { status: 'scheduled', endAt: { [Op.lt]: new Date() } },
    ];
  } else if (status) {
    where.status = status;
  }

  if (from || to) {
    where.startAt = {
      ...(where.startAt || {}),
      ...(from ? { [Op.gte]: new Date(from) } : {}),
      ...(to ? { [Op.lte]: new Date(to) } : {}),
    };
  }

  return where;
}

const listAppointments = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const offset = (page - 1) * limit;
  const where = buildListWhere(req);

  const { rows, count } = await Appointment.findAndCountAll({
    where,
    include: [providerInclude, patientInclude],
    order: [['startAt', 'ASC']],
    limit,
    offset,
  });

  await writeAuditLog({
    userId: req.user.id,
    action: 'LIST',
    entityType: 'Appointment',
    ipAddress: req.ip,
  });

  return ok(res, rows.map(serializeAppointment), {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  });
});

const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [providerInclude],
  });
  if (!appointment) throw new AppError('Appointment not found', 404, 'NOT_FOUND');

  if (req.user.role === 'patient' && appointment.patientId !== req.user.id) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }
  if (req.user.role === 'provider' && appointment.providerId !== req.user.id) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }

  await writeAuditLog({
    userId: req.user.id,
    action: 'READ',
    entityType: 'Appointment',
    entityId: appointment.id,
    ipAddress: req.ip,
  });

  return ok(res, serializeAppointment(appointment));
});

const createAppointment = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient' && req.user.role !== 'admin') {
    throw new AppError('Only patients can book appointments', 403, 'FORBIDDEN');
  }

  const provider = await User.findOne({
    where: { id: req.body.providerId, role: 'provider', isActive: true },
    include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
  });
  if (!provider || provider.ProviderProfile?.status !== 'active') {
    throw new AppError('Provider not available', 404, 'NOT_FOUND');
  }

  const startAt = new Date(req.body.startAt);
  const endAt = req.body.endAt ? new Date(req.body.endAt) : defaultEndAt(startAt);
  if (!(endAt > startAt)) {
    throw new AppError('endAt must be after startAt', 400, 'VALIDATION_ERROR');
  }

  const patientId = req.user.role === 'admin' && req.body.patientId
    ? req.body.patientId
    : req.user.id;

  let appointment;
  try {
    appointment = await sequelize.transaction(async (transaction) => {
      const createdAppt = await Appointment.create(
        {
          patientId,
          providerId: provider.id,
          startAt,
          endAt,
          visitType: normalizeVisitType(req.body.visitType),
          reason: req.body.reason,
          notes: req.body.notes || null,
          status: 'scheduled',
        },
        { transaction }
      );
      return createdAppt;
    });
  } catch (err) {
    if (err?.original?.constraint === 'appointments_no_provider_overlap') {
      throw new AppError(
        'This provider is already booked for the selected time',
        409,
        'SCHEDULING_CONFLICT'
      );
    }
    throw err;
  }

  const full = await Appointment.findByPk(appointment.id, { include: [providerInclude] });

  await writeAuditLog({
    userId: req.user.id,
    action: 'CREATE',
    entityType: 'Appointment',
    entityId: appointment.id,
    ipAddress: req.ip,
  });

  return created(res, serializeAppointment(full));
});

const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) throw new AppError('Appointment not found', 404, 'NOT_FOUND');

  if (req.user.role === 'patient' && appointment.patientId !== req.user.id) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }
  if (req.user.role === 'provider' && appointment.providerId !== req.user.id) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }

  const updates = {};
  if (req.body.providerId) updates.providerId = req.body.providerId;
  if (req.body.startAt) updates.startAt = new Date(req.body.startAt);
  if (req.body.endAt) updates.endAt = new Date(req.body.endAt);
  else if (req.body.startAt) updates.endAt = defaultEndAt(req.body.startAt);
  if (req.body.visitType) updates.visitType = normalizeVisitType(req.body.visitType);
  if (req.body.reason) updates.reason = req.body.reason;
  if (req.body.notes !== undefined) updates.notes = req.body.notes;
  if (req.body.status) updates.status = req.body.status;

  try {
    await appointment.update(updates);
  } catch (err) {
    if (err?.original?.constraint === 'appointments_no_provider_overlap') {
      throw new AppError(
        'This provider is already booked for the selected time',
        409,
        'SCHEDULING_CONFLICT'
      );
    }
    throw err;
  }

  const full = await Appointment.findByPk(appointment.id, { include: [providerInclude] });

  await writeAuditLog({
    userId: req.user.id,
    action: 'UPDATE',
    entityType: 'Appointment',
    entityId: appointment.id,
    ipAddress: req.ip,
  });

  return ok(res, serializeAppointment(full));
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) throw new AppError('Appointment not found', 404, 'NOT_FOUND');

  if (req.user.role === 'patient' && appointment.patientId !== req.user.id) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }
  if (req.user.role === 'provider' && appointment.providerId !== req.user.id) {
    throw new AppError('Appointment not found', 404, 'NOT_FOUND');
  }

  await appointment.update({ status: 'cancelled' });

  await writeAuditLog({
    userId: req.user.id,
    action: 'CANCEL',
    entityType: 'Appointment',
    entityId: appointment.id,
    ipAddress: req.ip,
  });

  return ok(res, { success: true, id: appointment.id });
});

const availableSlots = asyncHandler(async (req, res) => {
  const providerId = req.query.providerId;
  if (!providerId) throw new AppError('providerId is required', 400, 'VALIDATION_ERROR');

  const days = Number(req.query.days) || 3;
  const now = new Date();
  const slots = [];

  for (let d = 1; d <= days; d += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    day.setHours(0, 0, 0, 0);
    const times = ['08:30', '10:00', '11:30', '13:15', '15:00', '16:15'];
    const daySlots = [];

    for (const time of times) {
      const [h, m] = time.split(':').map(Number);
      const startAt = new Date(day);
      startAt.setHours(h, m, 0, 0);
      const endAt = defaultEndAt(startAt);

      const conflict = await Appointment.findOne({
        where: {
          providerId,
          status: 'scheduled',
          startAt: { [Op.lt]: endAt },
          endAt: { [Op.gt]: startAt },
        },
      });

      if (!conflict) {
        daySlots.push({
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          time: startAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        });
      }
    }

    if (daySlots.length) {
      slots.push({
        date: day.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        dateISO: day.toISOString().slice(0, 10),
        times: daySlots,
      });
    }
  }

  return ok(res, slots);
});

module.exports = {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  availableSlots,
};
