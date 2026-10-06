'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MessageThread extends Model {
    static associate(models) {
      MessageThread.belongsTo(models.User, {
        foreignKey: 'patientId',
        as: 'Patient',
      });
      MessageThread.belongsTo(models.User, {
        foreignKey: 'providerId',
        as: 'Provider',
      });
      MessageThread.hasMany(models.Message, {
        foreignKey: 'threadId',
        as: 'Messages',
        onDelete: 'CASCADE',
      });
    }
  }

  MessageThread.init(
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
      unreadByPatient: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'unread_by_patient',
      },
      unreadByProvider: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'unread_by_provider',
      },
    },
    {
      sequelize,
      modelName: 'MessageThread',
      tableName: 'message_threads',
      underscored: true,
    }
  );

  return MessageThread;
};
