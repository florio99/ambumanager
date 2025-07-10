const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hospital = sequelize.define('Hospital', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  emergencyBeds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'emergency_beds'
  },
  icuBeds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'icu_beds'
  },
  generalBeds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'general_beds'
  },
  specialties: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'hospitals'
});

module.exports = Hospital;