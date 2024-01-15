const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const Customer = require('./Customer');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Customer',
      key: 'id',
    },
  },
  orderDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  orderType: {
    type: DataTypes.ENUM('order', 'refund'),
    allowNull: false,
  },
  orderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
    tableName: 'Order',
    timestamps: false,
});

Order.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = Order;
