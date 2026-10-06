'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, dbConfig)
  : new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      dbConfig
    );

const User = require('./user')(sequelize, DataTypes);
const PatientProfile = require('./patientProfile')(sequelize, DataTypes);
const ProviderProfile = require('./providerProfile')(sequelize, DataTypes);
const Appointment = require('./appointment')(sequelize, DataTypes);
const VisitSummary = require('./visitSummary')(sequelize, DataTypes);
const LabResult = require('./labResult')(sequelize, DataTypes);
const Medication = require('./medication')(sequelize, DataTypes);
const Immunization = require('./immunization')(sequelize, DataTypes);
const MessageThread = require('./messageThread')(sequelize, DataTypes);
const Message = require('./message')(sequelize, DataTypes);
const BillingStatement = require('./billingStatement')(sequelize, DataTypes);
const StatementLine = require('./statementLine')(sequelize, DataTypes);
const ProxyAccess = require('./proxyAccess')(sequelize, DataTypes);
const RefreshToken = require('./refreshToken')(sequelize, DataTypes);
const AuditLog = require('./auditLog')(sequelize, DataTypes);

const models = {
  User,
  PatientProfile,
  ProviderProfile,
  Appointment,
  VisitSummary,
  LabResult,
  Medication,
  Immunization,
  MessageThread,
  Message,
  BillingStatement,
  StatementLine,
  ProxyAccess,
  RefreshToken,
  AuditLog,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
