const express = require('express');
const bodyParser = require('body-parser');
const insertRoute = require('./routes/insert');

const sequelize = require('./utils/database');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Routes
app.use('/insert', insertRoute);
// app.use('/upload', uploadRoute);
// app.use('/sales', salesRoute);

// Sync the database
// sequelize.sync()
//   .then(() => {
//     console.log('Database synchronized successfully.');
//   })
//   .catch((error) => {
//     console.error('Error synchronizing database:', error);
//   });

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
