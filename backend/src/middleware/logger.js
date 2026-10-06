'use strict';

const morgan = require('morgan');

// Avoid logging bodies/tokens/PHI — use method, URL, status, and timing only.
const logger = morgan(':method :url :status :res[content-length] - :response-time ms');

module.exports = logger;
