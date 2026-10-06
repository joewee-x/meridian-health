'use strict';

const express = require('express');
const requireAuth = require('../middleware/authentication');
const requireRole = require('../middleware/authorization');
const validate = require('../middleware/validator');
const {
  createAppointmentSchema,
  updateAppointmentSchema,
} = require('../validators/appointment');
const {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  availableSlots,
} = require('../controllers/appointment');

const router = express.Router();

router.use(requireAuth);

router.get('/slots', availableSlots);
router.get('/', listAppointments);
router.get('/:id', getAppointment);
router.post('/', requireRole('patient', 'admin'), validate(createAppointmentSchema), createAppointment);
router.patch('/:id', validate(updateAppointmentSchema), updateAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;
