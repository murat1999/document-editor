const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Change = sequelize.define('Change', {
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  insertText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  deleteTextCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  tableName: 'Change',
  timestamps: false,
});

module.exports = Change;
