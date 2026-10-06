'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PatientProfile extends Model {
    static associate(models) {
      PatientProfile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'User',
      });
      PatientProfile.belongsTo(models.User, {
        foreignKey: 'primaryDoctorId',
        as: 'PrimaryDoctor',
      });
    }
  }

  PatientProfile.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'user_id',
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'date_of_birth',
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      primaryDoctorId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'primary_doctor_id',
      },
      insuranceProvider: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'insurance_provider',
      },
      insuranceMemberId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'insurance_member_id',
      },
      insuranceGroupNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'insurance_group_number',
      },
      notifyAppointment: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'notify_appointment',
      },
      notifyMessages: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'notify_messages',
      },
      notifyResults: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'notify_results',
      },
      notifyBilling: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'notify_billing',
      },
      notifyEmail: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'notify_email',
      },
      notifySms: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'notify_sms',
      },
      notifyPush: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'notify_push',
      },
      outstandingBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'outstanding_balance',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'PatientProfile',
      tableName: 'patient_profiles',
      underscored: true,
    }
  );

  return PatientProfile;
};
