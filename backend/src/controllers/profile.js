'use strict';

const { User, PatientProfile, ProxyAccess } = require('../../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { writeAuditLog } = require('../utils/audit');
const { serializeUser } = require('../utils/serializers');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: PatientProfile, as: 'PatientProfile' }],
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  const profile = user.PatientProfile;
  const proxies = await ProxyAccess.findAll({
    where: { patientId: user.id, status: ['active', 'pending'] },
    order: [['createdAt', 'DESC']],
  });

  return ok(res, {
    user: serializeUser(user),
    personal: profile
      ? {
          name: `${user.firstName} ${user.lastName}`.trim(),
          dob: profile.dateOfBirth,
          phone: user.phone,
          address: profile.address,
        }
      : null,
    insurance: profile
      ? {
          provider: profile.insuranceProvider || '',
          memberId: profile.insuranceMemberId || '',
          groupNumber: profile.insuranceGroupNumber || '',
        }
      : null,
    notifications: profile
      ? {
          appointment: profile.notifyAppointment,
          messages: profile.notifyMessages,
          results: profile.notifyResults,
          billing: profile.notifyBilling,
          email: profile.notifyEmail,
          sms: profile.notifySms,
          push: profile.notifyPush,
        }
      : null,
    proxies: proxies.map((p) => ({
      id: p.id,
      name: p.proxyName,
      level: p.accessLevel === 'full' ? 'Full access' : 'Limited access',
      status: p.status,
    })),
  });
});

const updatePersonal = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: PatientProfile, as: 'PatientProfile' }],
  });
  if (!user || !user.PatientProfile) throw new AppError('Profile not found', 404, 'NOT_FOUND');

  const { name, dob, phone, address } = req.body;
  if (name) {
    const parts = name.trim().split(/\s+/);
    user.firstName = parts[0];
    user.lastName = parts.slice(1).join(' ') || parts[0];
  }
  if (phone !== undefined) user.phone = phone;
  await user.save();

  await user.PatientProfile.update({
    ...(dob !== undefined ? { dateOfBirth: dob } : {}),
    ...(address !== undefined ? { address } : {}),
  });

  await writeAuditLog({
    userId: req.user.id,
    action: 'UPDATE',
    entityType: 'PatientProfile',
    entityId: user.PatientProfile.id,
    ipAddress: req.ip,
  });

  return ok(res, { success: true });
});

const updateInsurance = asyncHandler(async (req, res) => {
  const profile = await PatientProfile.findOne({ where: { userId: req.user.id } });
  if (!profile) throw new AppError('Profile not found', 404, 'NOT_FOUND');

  await profile.update({
    insuranceProvider: req.body.provider,
    insuranceMemberId: req.body.memberId,
    insuranceGroupNumber: req.body.groupNumber,
  });

  return ok(res, { success: true });
});

const updateNotifications = asyncHandler(async (req, res) => {
  const profile = await PatientProfile.findOne({ where: { userId: req.user.id } });
  if (!profile) throw new AppError('Profile not found', 404, 'NOT_FOUND');

  const map = {
    appointment: 'notifyAppointment',
    messages: 'notifyMessages',
    results: 'notifyResults',
    billing: 'notifyBilling',
    email: 'notifyEmail',
    sms: 'notifySms',
    push: 'notifyPush',
  };

  const updates = {};
  for (const [key, column] of Object.entries(map)) {
    if (req.body[key] !== undefined) updates[column] = !!req.body[key];
  }
  await profile.update(updates);
  return ok(res, { success: true });
});

const listProxies = asyncHandler(async (req, res) => {
  const proxies = await ProxyAccess.findAll({
    where: { patientId: req.user.id, status: ['active', 'pending'] },
    order: [['createdAt', 'DESC']],
  });
  return ok(
    res,
    proxies.map((p) => ({
      id: p.id,
      name: p.proxyName,
      level: p.accessLevel === 'full' ? 'Full access' : 'Limited access',
      status: p.status,
    }))
  );
});

const createProxy = asyncHandler(async (req, res) => {
  const level =
    req.body.level === 'Full access' || req.body.accessLevel === 'full' ? 'full' : 'limited';

  const proxy = await ProxyAccess.create({
    patientId: req.user.id,
    proxyName: req.body.name,
    accessLevel: level,
    status: 'pending',
  });

  return ok(
    res,
    {
      id: proxy.id,
      name: proxy.proxyName,
      level: proxy.accessLevel === 'full' ? 'Full access' : 'Limited access',
      status: proxy.status,
    },
    undefined
  );
});

const revokeProxy = asyncHandler(async (req, res) => {
  const proxy = await ProxyAccess.findOne({
    where: { id: req.params.id, patientId: req.user.id },
  });
  if (!proxy) throw new AppError('Proxy not found', 404, 'NOT_FOUND');
  await proxy.update({ status: 'revoked' });
  return ok(res, { success: true });
});

module.exports = {
  getProfile,
  updatePersonal,
  updateInsurance,
  updateNotifications,
  listProxies,
  createProxy,
  revokeProxy,
};
