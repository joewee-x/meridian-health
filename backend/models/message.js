'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.MessageThread, {
        foreignKey: 'threadId',
        as: 'Thread',
      });
      Message.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'Sender',
      });
    }
  }

  Message.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      threadId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'thread_id',
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'sender_id',
      },
      senderRole: {
        type: DataTypes.ENUM('patient', 'provider', 'admin'),
        allowNull: false,
        field: 'sender_role',
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      attachmentName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'attachment_name',
      },
      attachmentType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'attachment_type',
      },
    },
    {
      sequelize,
      modelName: 'Message',
      tableName: 'messages',
      underscored: true,
    }
  );

  return Message;
};
