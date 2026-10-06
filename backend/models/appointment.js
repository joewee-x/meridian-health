'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.User, {
        foreignKey: 'patientId',
        as: 'Patient',
      });
      Appointment.belongsTo(models.User, {
        foreignKey: 'providerId',
        as: 'Provider',
      });
    }
  }

  Appointment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'patient_id',
      },
      providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'provider_id',
      },
      startAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'start_at',
      },
      endAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'end_at',
      },
      status: {
        type: DataTypes.ENUM(
          'scheduled',
          'completed',
          'cancelled',
          'no_show'
        ),
        allowNull: false,
        defaultValue: 'scheduled',
      },
      visitType: {
        type: DataTypes.ENUM('telehealth', 'in_person'),
        allowNull: false,
        field: 'visit_type',
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Appointment',
      tableName: 'appointments',
      underscored: true,
    }
  );

  return Appointment;
};
