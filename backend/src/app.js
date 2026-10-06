'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const env = require('../config/env');
const logger = require('./middleware/logger');
const { limiter } = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRoute = require('./routes/auth.route');
const appointmentRoute = require('./routes/appointment.route');
const providerRoute = require('./routes/provider.route');
const patientRoute = require('./routes/patient.route');
const recordsRoute = require('./routes/records.route');
const messageRoute = require('./routes/message.route');
const billingRoute = require('./routes/billing.route');
const profileRoute = require('./routes/profile.route');
const dashboardRoute = require('./routes/dashboard.route');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(logger);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(limiter);

app.get('/', (req, res) => {
  res.status(200).json({
    data: {
      name: 'Meridian Health API',
      version: 'v1',
      status: 'ok',
    },
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ data: { status: 'ok' } });
});

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/appointments', appointmentRoute);
app.use('/api/v1/providers', providerRoute);
app.use('/api/v1/patients', patientRoute);
app.use('/api/v1/records', recordsRoute);
app.use('/api/v1/messages', messageRoute);
app.use('/api/v1/billing', billingRoute);
app.use('/api/v1/profile', profileRoute);
app.use('/api/v1/dashboard', dashboardRoute);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
