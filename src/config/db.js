const mongoose = require('mongoose');
const { initializeJsonDbFallback } = require('./jsonDb');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/handloom_platform';
    console.log(`Connecting to MongoDB at: ${connStr}`);
    await mongoose.connect(connStr, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB Connected successfully.');
  } catch (error) {
    console.warn(`\n⚠️ MongoDB connection failed: ${error.message}`);
    console.warn('Falling back to Local JSON File Database driver for testing!\n');
    initializeJsonDbFallback();
  }
};

module.exports = connectDB;
