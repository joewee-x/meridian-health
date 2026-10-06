'use strict';

const express = require('express');
const requireAuth = require('../middleware/authentication');
const {
  listVisitSummaries,
  getVisitSummary,
  listLabResults,
  listMedications,
  requestRefill,
  listImmunizations,
} = require('../controllers/records');

const router = express.Router();

router.use(requireAuth);

router.get('/visits', listVisitSummaries);
router.get('/visits/:id', getVisitSummary);
router.get('/labs', listLabResults);
router.get('/medications', listMedications);
router.post('/medications/:id/refill', requestRefill);
router.get('/immunizations', listImmunizations);

module.exports = router;
