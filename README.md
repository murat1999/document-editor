
# Coding assignment

This is DDL for creating Customer and Order tables
- Customer table
`CREATE TABLE test-coding.Customer (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rating VARCHAR(255) NOT NULL
);`

- Order table
`CREATE TABLE test-coding.Order (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerId INT NOT NULL,
  orderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  orderType ENUM('order', 'refund') NOT NULL,
  orderAmount DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (customerId) REFERENCES Customer(id)
);`

- Change DB Connection credentials, create tables or use `sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
  });` to create tables automatically.

- run `npm run start` to start project and call 3 APIs

1. POST http://localhost:3000/insert with file in body
2. GET http://localhost:3000/sales
3. GET http://localhost:3000/orderlist with all possible req queries