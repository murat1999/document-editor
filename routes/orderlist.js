const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { Op, col } = require('sequelize');

router.get('/', async (req, res) => {
    try {
      // Pagination parameters
      const page = parseInt(req.query.pageNo) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;
      const offset = (page - 1) * pageSize;
  
      // Sorting parameter
      const order = [['orderDate', 'DESC']];
  
      // Filtering parameters
      const startDate = req.query.startDate || '1970-01-01';
      const endDate = req.query.endDate || '9999-12-31';
      const orderType = req.query.orderType === 1 ? 'refund' : 'order';
      const customerId = parseInt(req.query.customerId);
  
      // Build filter conditions
      const filterConditions = {
        orderDate: {
          [Op.between]: [startDate, endDate],
        },
        orderType: orderType ? { [Op.eq]: orderType } : { [Op.or]: ['order', 'refund'] },
      };
  
      if (!isNaN(customerId)) {
        // Check if customerId is a valid number
        filterConditions.customerId = customerId;
      }
      console.log(filterConditions)
  
      // Retrieve paginated and filtered order list
      const orderList = await Order.findAndCountAll({
        attributes: ['orderDate', 'orderType', 'orderAmount'],
        include: [
          {
            model: Customer,
            attributes: ['name', 'rating'],
            where: { id: col('Order.customerId') },
          },
        ],
        where: filterConditions,
        order,
        offset,
        limit: pageSize,
        raw: true,
      });
  
      // Format the result for better readability
      const formattedOrderList = orderList.rows.map(order => ({
        orderDate: order.orderDate,
        customerName: order['Customer.name'],
        customerRating: order['Customer.rating'],
        orderType: order.orderType,
        orderAmount: order.orderAmount,
      }));
      console.log(formattedOrderList)
  
      // Return the paginated and filtered order list
      res.status(200).json({
        orderList: formattedOrderList,
        totalCount: orderList.count,
        totalPages: Math.ceil(orderList.count / pageSize),
        currentPage: page,
      });
    } catch (error) {
      console.error('Error fetching order list:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
