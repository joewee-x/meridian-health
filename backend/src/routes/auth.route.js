'use strict';

const express = require('express');
const validate = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const requireAuth = require('../middleware/authentication');
const { registerSchema, loginSchema, verifyMfaSchema } = require('../validators/auth');
const {
  register,
  login,
  verifyMfa,
  me,
  refresh,
  logout,
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify-mfa', authLimiter, validate(verifyMfaSchema), verifyMfa);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
