const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const multer = require('multer');
// const fileUpload = require('express-fileupload');

const Customer = require('../models/Customer');
const Order = require('../models/Order');


// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
    
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  
        // Process Customer sheet
        const customerSheet = workbook.Sheets['customer'];
        const customersData = xlsx.utils.sheet_to_json(customerSheet, { header: 1 });

        // Check if the sheet has any data
        if (customersData.length === 0 || customersData.length === 1) {
            return res.status(400).json({ error: 'No data or only header row in the file.' });
        }
        const [customerHeader, ...customerDataRows] = customersData;
    
        // Map custom column names to Sequelize model fields for Customer
        const customerColumnMap = {
            '고객 id': 'id',
            '고객명': 'name',
            '고객등급': 'rating',
        };

        // Filter out rows where all cells are empty
        const nonEmptyCustomerDataRows = customerDataRows.filter(row => row.some(cell => cell !== null && cell !== ''));
    
        // Convert column names to Sequelize model fields for Customer
        const mappedCustomerData = nonEmptyCustomerDataRows.map(row => {
            const mappedRow = {};
            row.forEach((value, index) => {
              const columnName = customerHeader[index];
              const columnValue = customerColumnMap[columnName];
              mappedRow[columnValue] = value;
            });
            return mappedRow;
        });
    
        // Insert data into the Customer table
        await Customer.bulkCreate(mappedCustomerData);
    
        // Process Order sheet
        const orderSheet = workbook.Sheets['order'];
        const ordersData = xlsx.utils.sheet_to_json(orderSheet, { header: 1 });

        if (ordersData.length === 0 || ordersData.length === 1) {
            return res.status(400).json({ error: 'No data or only header row in the file.' });
        }
        const [orderHeader, ...orderDataRows] = ordersData;
    
        // Map custom column names to Sequelize model fields for Order
        const orderColumnMap = {
            '주문고객 id': 'customerId',
            '주문일자': 'orderDate',
            '주문타입': 'orderType',
            '주문금액': 'orderAmount',
        };
    
        // Filter out rows where all cells are empty
        const nonEmptyOrderDataRows = orderDataRows.filter(row => row.some(cell => cell !== null && cell !== ''));

        // Convert and insert non-empty rows into the Order table
        const mappedOrderData = nonEmptyOrderDataRows.map(row => {
        const mappedRow = {};
        row.forEach((value, index) => {
            const columnName = orderHeader[index];
            const columnValue = orderColumnMap[columnName];
            mappedRow[columnValue] = value;
        });
        return mappedRow;
        });
    
        // Insert data into the Order table
        await Order.bulkCreate(mappedOrderData);
    
        res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
