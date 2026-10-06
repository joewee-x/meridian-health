'use strict';

const express = require('express');
const requireAuth = require('../middleware/authentication');
const requireRole = require('../middleware/authorization');
const { listPatients, getPatient } = require('../controllers/patient');

const router = express.Router();

router.use(requireAuth);
router.get('/', requireRole('admin', 'provider'), listPatients);
router.get('/:id', requireRole('admin', 'provider', 'patient'), getPatient);

module.exports = router;
