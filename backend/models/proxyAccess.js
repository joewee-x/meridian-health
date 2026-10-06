'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProxyAccess extends Model {
    static associate(models) {
      ProxyAccess.belongsTo(models.User, {
        foreignKey: 'patientId',
        as: 'Patient',
      });
    }
  }

  ProxyAccess.init(
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
      proxyName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'proxy_name',
      },
      accessLevel: {
        type: DataTypes.ENUM('limited', 'full'),
        allowNull: false,
        defaultValue: 'limited',
        field: 'access_level',
      },
      status: {
        type: DataTypes.ENUM('active', 'revoked', 'pending'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'ProxyAccess',
      tableName: 'proxy_accesses',
      underscored: true,
    }
  );

  return ProxyAccess;
};
