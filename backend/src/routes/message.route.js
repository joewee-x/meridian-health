'use strict';

const express = require('express');
const { z } = require('zod');
const requireAuth = require('../middleware/authentication');
const validate = require('../middleware/validator');
const {
  listThreads,
  getThread,
  createThread,
  sendMessage,
} = require('../controllers/message');

const router = express.Router();

router.use(requireAuth);

router.get('/', listThreads);
router.post(
  '/',
  validate(z.object({ providerId: z.string().uuid() })),
  createThread
);
router.get('/:id', getThread);
router.post(
  '/:id/messages',
  validate(
    z.object({
      text: z.string().max(5000).optional(),
      attachment: z
        .object({
          name: z.string(),
          type: z.string().optional(),
        })
        .optional()
        .nullable(),
    })
  ),
  sendMessage
);

module.exports = router;
