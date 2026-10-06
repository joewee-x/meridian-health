'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.PatientProfile, {
        foreignKey: 'userId',
        as: 'PatientProfile',
        onDelete: 'CASCADE',
      });
      User.hasOne(models.ProviderProfile, {
        foreignKey: 'userId',
        as: 'ProviderProfile',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Appointment, {
        foreignKey: 'patientId',
        as: 'PatientAppointments',
      });
      User.hasMany(models.Appointment, {
        foreignKey: 'providerId',
        as: 'ProviderAppointments',
      });
      User.hasMany(models.MessageThread, {
        foreignKey: 'patientId',
        as: 'PatientThreads',
      });
      User.hasMany(models.MessageThread, {
        foreignKey: 'providerId',
        as: 'ProviderThreads',
      });
      User.hasMany(models.RefreshToken, {
        foreignKey: 'userId',
        as: 'RefreshTokens',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.AuditLog, {
        foreignKey: 'userId',
        as: 'AuditLogs',
      });
      User.hasMany(models.ProxyAccess, {
        foreignKey: 'patientId',
        as: 'Proxies',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.BillingStatement, {
        foreignKey: 'patientId',
        as: 'BillingStatements',
      });
      User.hasMany(models.VisitSummary, {
        foreignKey: 'patientId',
        as: 'VisitSummaries',
      });
      User.hasMany(models.LabResult, {
        foreignKey: 'patientId',
        as: 'LabResults',
      });
      User.hasMany(models.Medication, {
        foreignKey: 'patientId',
        as: 'Medications',
      });
      User.hasMany(models.Immunization, {
        foreignKey: 'patientId',
        as: 'Immunizations',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash',
      },
      role: {
        type: DataTypes.ENUM('patient', 'provider', 'admin'),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name',
        validate: { len: [1, 100] },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name',
        validate: { len: [1, 100] },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      defaultScope: {
        attributes: { exclude: ['passwordHash'] },
      },
      scopes: {
        withPassword: {
          attributes: {
            exclude: [],
          },
        },
      },
    }
  );

  return User;
};
