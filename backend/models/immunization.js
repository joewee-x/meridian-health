'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Immunization extends Model {
    static associate(models) {
      Immunization.belongsTo(models.User, {
        foreignKey: 'patientId',
        as: 'Patient',
      });
    }
  }

  Immunization.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      administeredOn: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'administered_on',
      },
    },
    {
      sequelize,
      modelName: 'Immunization',
      tableName: 'immunizations',
      underscored: true,
    }
  );

  return Immunization;
};
