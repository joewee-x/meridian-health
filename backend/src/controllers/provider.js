'use strict';

const { Op } = require('sequelize');
const { User, ProviderProfile } = require('../../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { writeAuditLog } = require('../utils/audit');

function serializeProvider(user) {
  const profile = user.ProviderProfile;
  const name = `Dr. ${user.firstName} ${user.lastName}${profile?.credentials ? `, ${profile.credentials}` : ''}`.replace(/,\s*$/, '');
  return {
    id: user.id,
    name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: profile?.specialty || 'Provider',
    specialty: profile?.specialty,
    specialtyId: profile?.specialtySlug,
    education: profile?.education,
    credentials: profile?.credentials || profile?.education,
    experienceYears: profile?.experienceYears,
    rating: profile?.rating ? Number(profile.rating) : null,
    reviewsCount: profile?.reviewsCount || 0,
    languages: profile?.languages || ['English'],
    availability: profile?.acceptingNew ? 'Accepting patients' : 'Waitlist',
    acceptingNew: !!profile?.acceptingNew,
    telehealth: !!profile?.telehealth,
    inPerson: !!profile?.inPerson,
    location: profile?.location,
    bio: profile?.bio,
    avatarColor: profile?.avatarColor || 'bg-teal-100 text-teal-800 border-teal-200',
    status: profile?.status,
    submitted: profile?.submittedAt
      ? new Date(profile.submittedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null,
    initials: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase(),
    supportsTelehealth: !!profile?.telehealth,
    npi: profile?.npi,
    title: profile?.title,
  };
}

const listProviders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const offset = (page - 1) * limit;
  const { search, status, specialty } = req.query;

  const profileWhere = {};
  if (status && status !== 'all') profileWhere.status = status;
  else if (!req.user || req.user.role !== 'admin') profileWhere.status = 'active';
  if (specialty && specialty !== 'all') profileWhere.specialty = specialty;

  const userWhere = { role: 'provider' };
  if (search) {
    userWhere[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where: userWhere,
    include: [
      {
        model: ProviderProfile,
        as: 'ProviderProfile',
        where: Object.keys(profileWhere).length ? profileWhere : undefined,
        required: true,
      },
    ],
    limit,
    offset,
    order: [[{ model: ProviderProfile, as: 'ProviderProfile' }, 'status', 'ASC'], ['lastName', 'ASC']],
  });

  return ok(res, rows.map(serializeProvider), {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  });
});

const getProvider = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id, role: 'provider' },
    include: [{ model: ProviderProfile, as: 'ProviderProfile', required: true }],
  });
  if (!user) throw new AppError('Provider not found', 404, 'NOT_FOUND');

  if (
    (!req.user || req.user.role !== 'admin') &&
    user.ProviderProfile.status !== 'active'
  ) {
    throw new AppError('Provider not found', 404, 'NOT_FOUND');
  }

  return ok(res, serializeProvider(user));
});

const updateProvider = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id, role: 'provider' },
    include: [{ model: ProviderProfile, as: 'ProviderProfile', required: true }],
  });
  if (!user) throw new AppError('Provider not found', 404, 'NOT_FOUND');

  const profile = user.ProviderProfile;
  const {
    specialty,
    bio,
    credentials,
    status,
    rejectionReason,
    telehealth,
    inPerson,
    acceptingNew,
    location,
    title,
  } = req.body;

  await profile.update({
    ...(specialty !== undefined ? { specialty } : {}),
    ...(bio !== undefined ? { bio } : {}),
    ...(credentials !== undefined ? { credentials } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(rejectionReason !== undefined ? { rejectionReason } : {}),
    ...(telehealth !== undefined ? { telehealth } : {}),
    ...(inPerson !== undefined ? { inPerson } : {}),
    ...(acceptingNew !== undefined ? { acceptingNew } : {}),
    ...(location !== undefined ? { location } : {}),
    ...(title !== undefined ? { title } : {}),
  });

  await writeAuditLog({
    userId: req.user.id,
    action: 'UPDATE',
    entityType: 'ProviderProfile',
    entityId: profile.id,
    ipAddress: req.ip,
  });

  await user.reload({ include: [{ model: ProviderProfile, as: 'ProviderProfile' }] });
  return ok(res, serializeProvider(user));
});

module.exports = { listProviders, getProvider, updateProvider, serializeProvider };
