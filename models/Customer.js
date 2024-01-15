const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: false,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'Customer',
  timestamps: false,
});

module.exports = Customer;
