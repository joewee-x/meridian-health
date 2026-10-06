'use strict';

const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  phone: z.string().trim().max(30).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

const verifyMfaSchema = z.object({
  pendingToken: z.string().min(10),
  code: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit verification code'),
});

module.exports = { registerSchema, loginSchema, verifyMfaSchema };
