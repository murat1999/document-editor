const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const insertRoute = require('./routes/insert');

const sequelize = require('./utils/database');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

const routesPath = path.join(__dirname, 'routes');
const routeFiles = fs.readdirSync(routesPath);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Routes
routeFiles.forEach(file => {
    const routePath = `/${path.parse(file).name}`; // Use the filename as the route path
    const route = require(path.join(routesPath, file));
    console.log
    app.use(routePath, route);
});

// Sync the database
sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
  });

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
