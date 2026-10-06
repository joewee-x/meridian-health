'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LabResult extends Model {
    static associate(models) {
      LabResult.belongsTo(models.User, {
        foreignKey: 'patientId',
        as: 'Patient',
      });
      LabResult.belongsTo(models.User, {
        foreignKey: 'orderedById',
        as: 'OrderedBy',
      });
    }
  }

  LabResult.init(
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
      orderedById: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'ordered_by_id',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resultDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'result_date',
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('normal', 'attention', 'critical'),
        allowNull: false,
        defaultValue: 'normal',
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rangeText: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'range_text',
      },
      educationUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'education_url',
      },
      isNew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_new',
      },
    },
    {
      sequelize,
      modelName: 'LabResult',
      tableName: 'lab_results',
      underscored: true,
    }
  );

  return LabResult;
};
