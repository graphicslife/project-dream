const { DataTypes } = require('sequelize');
const db = require('../config/db');

const SystemSetting = db.define('SystemSetting', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'system_settings',
  timestamps: false
});

module.exports = SystemSetting;
