'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VisitSummary extends Model {
    static associate(models) {
      VisitSummary.belongsTo(models.User, {
        foreignKey: 'patientId',
        as: 'Patient',
      });
      VisitSummary.belongsTo(models.User, {
        foreignKey: 'providerId',
        as: 'Provider',
      });
      VisitSummary.belongsTo(models.Appointment, {
        foreignKey: 'appointmentId',
        as: 'Appointment',
      });
    }
  }

  VisitSummary.init(
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
      appointmentId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'appointment_id',
      },
      visitDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'visit_date',
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      followUp: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'follow_up',
      },
    },
    {
      sequelize,
      modelName: 'VisitSummary',
      tableName: 'visit_summaries',
      underscored: true,
    }
  );

  return VisitSummary;
};
