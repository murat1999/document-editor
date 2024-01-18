const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Doc = sequelize.define('Doc', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'Doc',
  timestamps: false,
});

module.exports = Doc;
