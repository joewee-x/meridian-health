'use strict';

const { Op } = require('sequelize');
const {
  Appointment,
  MessageThread,
  LabResult,
  PatientProfile,
  ProviderProfile,
  User,
} = require('../../models');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { serializeAppointment } = require('../utils/serializers');

const patientDashboard = asyncHandler(async (req, res) => {
  const patientId = req.user.id;

  const upcoming = await Appointment.findAll({
    where: {
      patientId,
      status: 'scheduled',
      startAt: { [Op.gte]: new Date() },
    },
    include: [
      {
        model: User,
        as: 'Provider',
        attributes: ['id', 'firstName', 'lastName'],
        include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
      },
    ],
    order: [['startAt', 'ASC']],
    limit: 5,
  });

  const unreadMessages = await MessageThread.count({
    where: { patientId, unreadByPatient: true },
  });

  const newLabs = await LabResult.count({
    where: { patientId, isNew: true },
  });

  const profile = await PatientProfile.findOne({ where: { userId: patientId } });
  const next = upcoming[0] ? serializeAppointment(upcoming[0]) : null;

  return ok(res, {
    appointment: next
      ? {
          id: next.id,
          provider: next.provider,
          dateTime: `${next.date} at ${next.time}`,
          visitType: next.visitType,
          startsSoon: next.startsSoon,
        }
      : null,
    upcomingAppointmentCount: upcoming.length,
    unreadMessages,
    update: newLabs > 0 ? `${newLabs} new lab result${newLabs === 1 ? '' : 's'}` : null,
    outstandingBalance: profile ? Number(profile.outstandingBalance) : 0,
  });
});

const adminDashboard = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [activePatients, appointmentsToday, pendingProviders] = await Promise.all([
    PatientProfile.count({ where: { status: 'active' } }),
    Appointment.count({
      where: {
        startAt: { [Op.between]: [startOfDay, endOfDay] },
        status: { [Op.ne]: 'cancelled' },
      },
    }),
    ProviderProfile.count({ where: { status: 'pending' } }),
  ]);

  return ok(res, {
    activePatients,
    appointmentsToday,
    pendingProviders,
    systemAlerts: pendingProviders > 0 ? 1 : 0,
  });
});

module.exports = { patientDashboard, adminDashboard };
