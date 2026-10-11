
const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;

  if (!connStr) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(connStr, {
    serverSelectionTimeoutMS: 10000
  });

  console.log('MongoDB Connected successfully.');
  return true;
};

module.exports = connectDB;
