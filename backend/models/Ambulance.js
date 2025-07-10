const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ambulance = sequelize.define('Ambulance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  plateNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'plate_number'
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  status: {
    type: DataTypes.ENUM('disponible', 'en_mission', 'en_panne', 'maintenance'),
    allowNull: false,
    defaultValue: 'disponible'
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  locationUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'location_updated_at'
  },
  equipment: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  fuelLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    field: 'fuel_level',
    validate: {
      min: 0,
      max: 100
    }
  },
  mileage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'ambulances'
});

module.exports = Ambulance;