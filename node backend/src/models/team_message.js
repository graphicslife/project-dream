const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TeamMessage = sequelize.define('TeamMessage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  subject: { type: DataTypes.STRING(180), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'new' },
  admin_notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'team_messages', timestamps: false });

module.exports = TeamMessage;
