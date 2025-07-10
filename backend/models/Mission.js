const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mission = sequelize.define('Mission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'patient_name'
  },
  patientPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'patient_phone'
  },
  patientAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'patient_age'
  },
  patientCondition: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'patient_condition'
  },
  priority: {
    type: DataTypes.ENUM('critique', 'urgente', 'normale', 'faible'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('en_attente', 'assignee', 'en_cours', 'terminee', 'annulee'),
    allowNull: false,
    defaultValue: 'en_attente'
  },
  pickupAddress: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'pickup_address'
  },
  pickupLatitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'pickup_latitude'
  },
  pickupLongitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'pickup_longitude'
  },
  hospitalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'hospital_id',
    references: {
      model: 'hospitals',
      key: 'id'
    }
  },
  ambulanceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'ambulance_id',
    references: {
      model: 'ambulances',
      key: 'id'
    }
  },
  assignedPersonnel: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    field: 'assigned_personnel'
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'assigned_at'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    field: 'estimated_duration'
  },
  actualDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'actual_duration'
  },
  symptoms: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'missions'
});

module.exports = Mission;