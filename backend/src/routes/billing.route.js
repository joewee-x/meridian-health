'use strict';

const express = require('express');
const { z } = require('zod');
const requireAuth = require('../middleware/authentication');
const validate = require('../middleware/validator');
const {
  getBillingOverview,
  getStatement,
  payBalance,
} = require('../controllers/billing');

const router = express.Router();

router.use(requireAuth);

router.get('/', getBillingOverview);
router.get('/statements/:id', getStatement);
router.post(
  '/pay',
  validate(
    z.object({
      cardNumber: z.string().min(12),
      expiry: z.string().min(3),
      cvv: z.string().min(3),
    })
  ),
  payBalance
);

module.exports = router;
