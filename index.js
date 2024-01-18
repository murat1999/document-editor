const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const sequelize = require('./utils/database');
const initializeDatabase = require('./utils/initializeDb');

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
initializeDatabase();

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
