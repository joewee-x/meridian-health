'use strict';

const express = require('express');
const requireAuth = require('../middleware/authentication');
const requireRole = require('../middleware/authorization');
const { patientDashboard, adminDashboard } = require('../controllers/dashboard');

const router = express.Router();

router.get('/patient', requireAuth, requireRole('patient'), patientDashboard);
router.get('/admin', requireAuth, requireRole('admin'), adminDashboard);

module.exports = router;
