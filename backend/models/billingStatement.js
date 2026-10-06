'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BillingStatement extends Model {
    static associate(models) {
      BillingStatement.belongsTo(models.User, {
        foreignKey: 'patientId',
        as: 'Patient',
      });
      BillingStatement.hasMany(models.StatementLine, {
        foreignKey: 'statementId',
        as: 'Lines',
        onDelete: 'CASCADE',
      });
    }
  }

  BillingStatement.init(
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
      statementDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'statement_date',
      },
      visitDescription: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'visit_description',
      },
      amountOwed: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'amount_owed',
      },
      status: {
        type: DataTypes.ENUM('open', 'paid', 'partial'),
        allowNull: false,
        defaultValue: 'open',
      },
    },
    {
      sequelize,
      modelName: 'BillingStatement',
      tableName: 'billing_statements',
      underscored: true,
    }
  );

  return BillingStatement;
};
