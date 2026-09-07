const { DataTypes } = require('sequelize');
const db = require('../config/db');

const AdminLog = db.define('AdminLog', {
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'admin_logs',
  timestamps: false
});

module.exports = AdminLog;
