'use strict';

const express = require('express');
const requireAuth = require('../middleware/authentication');
const requireRole = require('../middleware/authorization');
const {
  listProviders,
  getProvider,
  updateProvider,
} = require('../controllers/provider');

const router = express.Router();

router.get('/', (req, res, next) => {
  // Public directory listing — optional auth for admin filters
  if (req.headers.authorization) {
    return requireAuth(req, res, (err) => {
      if (err) return next(err);
      return listProviders(req, res, next);
    });
  }
  return listProviders(req, res, next);
});

router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    return requireAuth(req, res, (err) => {
      if (err) return next(err);
      return getProvider(req, res, next);
    });
  }
  return getProvider(req, res, next);
});

router.patch('/:id', requireAuth, requireRole('admin'), updateProvider);

module.exports = router;
