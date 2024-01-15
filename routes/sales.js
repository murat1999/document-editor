// insert this in your routes or a separate file, e.g., salesRoute.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { Op, literal, col, fn } = require('sequelize');

router.get('/', async (req, res) => {
    try {
      // Calculate monthly sales statistics
      const monthlySales = await Order.findAll({
        attributes: [
          [fn('YEAR', col('orderDate')), 'year'],
          [fn('MONTH', col('orderDate')), 'month'],
          [literal(`SUM(CASE WHEN orderType = 'order' THEN orderAmount ELSE 0 END)`), 'totalOrderAmount'],
          [literal(`SUM(CASE WHEN orderType = 'refund' THEN orderAmount ELSE 0 END)`), 'totalRefundAmount'],
        ],
        group: ['year', 'month'],
        order: [['year', 'ASC'], ['month', 'ASC']],
      });
  
      // Format the result for better readability
      const formattedSales = monthlySales.map(sale => ({
        year: sale.get('year'),
        month: sale.get('month'),
        totalOrderAmount: Number(sale.get('totalOrderAmount')).toLocaleString('en-US'),
        totalRefundAmount: Number(sale.get('totalRefundAmount')).toLocaleString('en-US'),
        totalSales: Number(sale.get('totalOrderAmount') - sale.get('totalRefundAmount')).toLocaleString('en-US'),
      }));
  
      res.status(200).json({ monthlySales: formattedSales });
    } catch (error) {
      console.error('Error fetching monthly sales:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
