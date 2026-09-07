const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'team_members',
  timestamps: false
});

module.exports = TeamMember;
