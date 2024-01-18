const sequelize = require('./database');
const Doc = require('../models/Doc');

async function initializeDatabase() {
  try {
    // Sync the models with the database (create tables if not exist)
    await sequelize.sync({ force: true });

    // Add default records or perform other initialization steps
    await Doc.create({
      content: 'ABCDE',
      version: 0,
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = initializeDatabase;
