const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Gallery = db.define('Gallery', {
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  caption: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'gallery',
  timestamps: false
});

module.exports = Gallery;
