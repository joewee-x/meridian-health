'use strict';

const { User } = require('../../models');
const { verifyAccessToken } = require('../utils/tokens');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const [scheme, token] = authHeader.split(' ');
  if (!/^Bearer$/i.test(scheme) || !token) {
    throw new AppError('Invalid authentication token', 401, 'UNAUTHORIZED');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }

  const user = await User.findByPk(payload.id);
  if (!user || !user.isActive) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  next();
});

module.exports = requireAuth;
