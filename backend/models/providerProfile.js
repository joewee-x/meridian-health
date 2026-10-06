'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProviderProfile extends Model {
    static associate(models) {
      ProviderProfile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'User',
      });
    }
  }

  ProviderProfile.init(
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
      specialty: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      specialtySlug: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'specialty_slug',
      },
      credentials: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      npi: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      education: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      experienceYears: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'experience_years',
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      reviewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'reviews_count',
      },
      languages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: ['English'],
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      telehealth: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      inPerson: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'in_person',
      },
      acceptingNew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'accepting_new',
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'inactive'),
        allowNull: false,
        defaultValue: 'pending',
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason',
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'submitted_at',
      },
      avatarColor: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'avatar_color',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ProviderProfile',
      tableName: 'provider_profiles',
      underscored: true,
    }
  );

  return ProviderProfile;
};
