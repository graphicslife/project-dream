const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VolunteerInterest = sequelize.define('VolunteerInterest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  location: { type: DataTypes.STRING(150), allowNull: true },
  interests: { type: DataTypes.JSON, allowNull: false },
  availability: { type: DataTypes.STRING(100), allowNull: true },
  experience: { type: DataTypes.TEXT, allowNull: true },
  motivation: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'new' },
  admin_notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'volunteer_interests', timestamps: false });

module.exports = VolunteerInterest;
