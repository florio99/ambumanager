const sequelize = require('../config/database');
const User = require('./User');
const Ambulance = require('./Ambulance');
const Hospital = require('./Hospital');
const Mission = require('./Mission');

// Définir les associations
Mission.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });
Mission.belongsTo(Ambulance, { foreignKey: 'ambulanceId', as: 'ambulance' });

Hospital.hasMany(Mission, { foreignKey: 'hospitalId', as: 'missions' });
Ambulance.hasMany(Mission, { foreignKey: 'ambulanceId', as: 'missions' });

module.exports = {
  sequelize,
  User,
  Ambulance,
  Hospital,
  Mission
};