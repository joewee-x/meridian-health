'use strict';

const express = require('express');
const { z } = require('zod');
const requireAuth = require('../middleware/authentication');
const requireRole = require('../middleware/authorization');
const validate = require('../middleware/validator');
const {
  getProfile,
  updatePersonal,
  updateInsurance,
  updateNotifications,
  listProxies,
  createProxy,
  revokeProxy,
} = require('../controllers/profile');

const router = express.Router();

router.use(requireAuth, requireRole('patient'));

router.get('/', getProfile);
router.patch(
  '/personal',
  validate(
    z.object({
      name: z.string().min(2).optional(),
      dob: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
  ),
  updatePersonal
);
router.patch(
  '/insurance',
  validate(
    z.object({
      provider: z.string().min(1),
      memberId: z.string().min(1),
      groupNumber: z.string().min(1),
    })
  ),
  updateInsurance
);
router.patch('/notifications', updateNotifications);
router.get('/proxies', listProxies);
router.post(
  '/proxies',
  validate(
    z.object({
      name: z.string().min(2),
      level: z.string().optional(),
      accessLevel: z.enum(['limited', 'full']).optional(),
    })
  ),
  createProxy
);
router.delete('/proxies/:id', revokeProxy);

module.exports = router;
