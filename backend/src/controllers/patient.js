'use strict';

const { Op } = require('sequelize');
const {
  User,
  PatientProfile,
  Appointment,
  ProviderProfile,
} = require('../../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { writeAuditLog } = require('../utils/audit');
const { serializeAppointment } = require('../utils/serializers');

const listPatients = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const offset = (page - 1) * limit;
  const { search, status } = req.query;

  const profileWhere = {};
  if (status && status !== 'all') profileWhere.status = status;

  const userWhere = { role: 'patient' };
  if (search) {
    userWhere[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (req.user.role === 'provider') {
    const patientIds = await Appointment.findAll({
      where: { providerId: req.user.id },
      attributes: ['patientId'],
      group: ['patientId'],
    });
    userWhere.id = patientIds.map((row) => row.patientId);
  }

  const { rows, count } = await User.findAndCountAll({
    where: userWhere,
    include: [
      {
        model: PatientProfile,
        as: 'PatientProfile',
        where: Object.keys(profileWhere).length ? profileWhere : undefined,
        required: true,
      },
    ],
    limit,
    offset,
    order: [['lastName', 'ASC']],
  });

  const data = [];
  for (const user of rows) {
    const appointments = await Appointment.findAll({
      where: { patientId: user.id },
      include: [
        {
          model: User,
          as: 'Provider',
          attributes: ['id', 'firstName', 'lastName'],
          include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
        },
      ],
      order: [['startAt', 'DESC']],
      limit: 5,
    });

    const profile = user.PatientProfile;
    data.push({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone,
      registered: user.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: profile.status,
      billing: Number(profile.outstandingBalance) > 0 ? 'balance owed' : 'paid up',
      balance: Number(profile.outstandingBalance),
      insurance: profile.insuranceProvider
        ? `${profile.insuranceProvider}${profile.insuranceMemberId ? ` · ${profile.insuranceMemberId}` : ''}`
        : 'Self-pay',
      appointments: appointments.map((a) => ({
        date: serializeAppointment(a).date + (serializeAppointment(a).time ? `, ${serializeAppointment(a).time}` : ''),
        provider: serializeAppointment(a).provider,
        status: a.status === 'scheduled' ? 'Scheduled' : a.status === 'completed' ? 'Completed' : a.status,
      })),
    });
  }

  await writeAuditLog({
    userId: req.user.id,
    action: 'LIST',
    entityType: 'Patient',
    ipAddress: req.ip,
  });

  return ok(res, data, {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  });
});

const getPatient = asyncHandler(async (req, res) => {
  if (req.user.role === 'patient' && req.params.id !== req.user.id) {
    throw new AppError('Patient not found', 404, 'NOT_FOUND');
  }

  const user = await User.findOne({
    where: { id: req.params.id, role: 'patient' },
    include: [{ model: PatientProfile, as: 'PatientProfile', required: true }],
  });
  if (!user) throw new AppError('Patient not found', 404, 'NOT_FOUND');

  if (req.user.role === 'provider') {
    const linked = await Appointment.findOne({
      where: { providerId: req.user.id, patientId: user.id },
    });
    if (!linked) throw new AppError('Patient not found', 404, 'NOT_FOUND');
  }

  await writeAuditLog({
    userId: req.user.id,
    action: 'READ',
    entityType: 'Patient',
    entityId: user.id,
    ipAddress: req.ip,
  });

  const profile = user.PatientProfile;
  return ok(res, {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    phone: user.phone,
    registered: user.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    dateOfBirth: profile.dateOfBirth,
    address: profile.address,
    insurance: {
      provider: profile.insuranceProvider,
      memberId: profile.insuranceMemberId,
      groupNumber: profile.insuranceGroupNumber,
    },
    notifications: {
      appointment: profile.notifyAppointment,
      messages: profile.notifyMessages,
      results: profile.notifyResults,
      billing: profile.notifyBilling,
      email: profile.notifyEmail,
      sms: profile.notifySms,
      push: profile.notifyPush,
    },
    outstandingBalance: Number(profile.outstandingBalance),
    status: profile.status,
  });
});

module.exports = { listPatients, getPatient };
