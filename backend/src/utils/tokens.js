'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
}

function signRefreshToken(user) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, jti },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );
  return { token, jti };
}

function signMfaToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, purpose: 'mfa' },
    env.jwtAccessSecret,
    { expiresIn: env.jwtMfaExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

function verifyMfaToken(token) {
  const payload = jwt.verify(token, env.jwtAccessSecret);
  if (payload.purpose !== 'mfa') {
    const err = new Error('Invalid MFA token');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return payload;
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function parseExpiryMs(value) {
  const match = String(value).match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return amount * multipliers[unit];
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  signMfaToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyMfaToken,
  refreshCookieOptions,
  parseExpiryMs,
};
