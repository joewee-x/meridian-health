'use strict';

const {
  User,
  PatientProfile,
  ProviderProfile,
  RefreshToken,
  sequelize,
} = require('../../models');
const env = require('../../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const { hashPassword, comparePassword, hashToken } = require('../utils/hashPassword');
const {
  signAccessToken,
  signRefreshToken,
  signMfaToken,
  verifyMfaToken,
  verifyRefreshToken,
  refreshCookieOptions,
  parseExpiryMs,
} = require('../utils/tokens');
const { serializeUser, maskPhone, initialsFromName, portalUrlForRole } = require('../utils/serializers');
const { writeAuditLog } = require('../utils/audit');

function splitName(name) {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

async function issueSession(res, user) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, jti } = signRefreshToken(user);
  const tokenHash = await hashToken(refreshToken);

  await RefreshToken.create({
    id: jti,
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + parseExpiryMs(env.jwtRefreshExpiresIn)),
    revoked: false,
  });

  res.cookie('refreshToken', refreshToken, refreshCookieOptions());
  return { accessToken, user: serializeUser(user) };
}

function loadUserIncludes() {
  return [
    { model: PatientProfile, as: 'PatientProfile' },
    { model: ProviderProfile, as: 'ProviderProfile' },
  ];
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, dateOfBirth, phone } = req.body;
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    // Generic message — avoid user enumeration
    throw new AppError('Unable to create account with the provided details', 409, 'CONFLICT');
  }

  const { firstName, lastName } = splitName(name);
  const passwordHash = await hashPassword(password);

  const user = await sequelize.transaction(async (transaction) => {
    const createdUser = await User.create(
      {
        email,
        passwordHash,
        role: 'patient',
        firstName,
        lastName,
        phone: phone || '(555) 234-5678',
        isActive: true,
      },
      { transaction }
    );

    await PatientProfile.create(
      {
        userId: createdUser.id,
        dateOfBirth: dateOfBirth || null,
        status: 'active',
      },
      { transaction }
    );

    return createdUser;
  });

  await writeAuditLog({
    userId: user.id,
    action: 'REGISTER',
    entityType: 'User',
    entityId: user.id,
    ipAddress: req.ip,
  });

  const pendingToken = signMfaToken(user);
  return created(res, {
    requiresMfa: true,
    maskedPhone: maskPhone(user.phone),
    pendingToken,
    pendingUser: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`.trim(),
      avatarInitials: initialsFromName(`${user.firstName} ${user.lastName}`),
      portalUrl: portalUrlForRole(user.role),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.unscoped().findOne({ where: { email } });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const pendingToken = signMfaToken(user);
  return ok(res, {
    requiresMfa: true,
    maskedPhone: maskPhone(user.phone),
    pendingToken,
    pendingUser: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`.trim(),
      avatarInitials: initialsFromName(`${user.firstName} ${user.lastName}`),
      portalUrl: portalUrlForRole(user.role),
    },
  });
});

const verifyMfa = asyncHandler(async (req, res) => {
  const { pendingToken, code } = req.body;

  let payload;
  try {
    payload = verifyMfaToken(pendingToken);
  } catch {
    throw new AppError('Authentication session expired. Please sign in again.', 401, 'SESSION_EXPIRED');
  }

  // Demo MFA: accept configured demo code or any 6-digit code in non-production.
  const isValidDemo =
    code === env.demoMfaCode || (!env.isProduction && /^\d{6}$/.test(code));
  if (!isValidDemo) {
    throw new AppError('Invalid verification code', 401, 'INVALID_MFA');
  }

  const user = await User.findByPk(payload.id, { include: loadUserIncludes() });
  if (!user || !user.isActive) {
    throw new AppError('Authentication session expired. Please sign in again.', 401, 'SESSION_EXPIRED');
  }

  const session = await issueSession(res, user);

  await writeAuditLog({
    userId: user.id,
    action: 'LOGIN',
    entityType: 'User',
    entityId: user.id,
    ipAddress: req.ip,
  });

  return ok(res, {
    success: true,
    token: session.accessToken,
    user: session.user,
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, { include: loadUserIncludes() });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return ok(res, serializeUser(user));
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token missing', 401, 'UNAUTHORIZED');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }

  const stored = await RefreshToken.findByPk(payload.jti);
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }

  const { compareToken } = require('../utils/hashPassword');
  const matches = await compareToken(token, stored.tokenHash);
  if (!matches) {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }

  const user = await User.findByPk(payload.id, { include: loadUserIncludes() });
  if (!user || !user.isActive) {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }

  stored.revoked = true;
  await stored.save();

  const session = await issueSession(res, user);
  return ok(res, { token: session.accessToken, user: session.user });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      const stored = await RefreshToken.findByPk(payload.jti);
      if (stored) {
        stored.revoked = true;
        await stored.save();
      }
    } catch {
      // Ignore invalid refresh cookies on logout
    }
  }

  res.clearCookie('refreshToken', refreshCookieOptions());

  if (req.user?.id) {
    await writeAuditLog({
      userId: req.user.id,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: req.user.id,
      ipAddress: req.ip,
    });
  }

  return ok(res, { success: true });
});

module.exports = { register, login, verifyMfa, me, refresh, logout };
