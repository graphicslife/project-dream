const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  amount: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'TZS'
  },
  donation_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'money'
  },
  program: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  donor_name: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  donor_email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  donor_phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  promises: {
    type: DataTypes.JSON,
    allowNull: true
  },
  follow_up_status: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: 'pending'
  },
  follow_up_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  donated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'donations',
  timestamps: false
});

module.exports = Donation;
