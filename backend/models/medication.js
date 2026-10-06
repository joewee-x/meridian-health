'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Medication extends Model {
    static associate(models) {
      Medication.belongsTo(models.User, {
        foreignKey: 'patientId',
        as: 'Patient',
      });
      Medication.belongsTo(models.User, {
        foreignKey: 'prescribedById',
        as: 'PrescribedBy',
      });
    }
  }

  Medication.init(
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
      prescribedById: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'prescribed_by_id',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dosage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refillStatus: {
        type: DataTypes.ENUM('none', 'pending', 'approved', 'denied'),
        allowNull: false,
        defaultValue: 'none',
        field: 'refill_status',
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
      modelName: 'Medication',
      tableName: 'medications',
      underscored: true,
    }
  );

  return Medication;
};
