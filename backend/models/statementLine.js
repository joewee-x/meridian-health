'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StatementLine extends Model {
    static associate(models) {
      StatementLine.belongsTo(models.BillingStatement, {
        foreignKey: 'statementId',
        as: 'Statement',
      });
    }
  }

  StatementLine.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      statementId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'statement_id',
      },
      service: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      billed: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      insurance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      owed: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'StatementLine',
      tableName: 'statement_lines',
      underscored: true,
    }
  );

  return StatementLine;
};
