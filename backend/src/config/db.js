const mongoose = require('mongoose');

/**
 * Safely mask sensitive credentials from connection strings for logs
 */
function maskUri(uri) {
  if (!uri) return 'undefined';
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, '$1***:***@');
  } catch {
    return '***masked-uri***';
  }
}

let isConnecting = false;

const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'CRITICAL CONFIG ERROR: MONGODB_URI is not defined in environment variables. Please provide a valid MongoDB connection string.';
    console.error(`[DB-ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return mongoose.connection;
  }

  isConnecting = true;
  console.log(`[DB-INIT] Connecting to MongoDB at: ${maskUri(uri)}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    console.log(`[DB-SUCCESS] MongoDB Connected: Host=${conn.connection.host}, DB=${conn.connection.name}`);
    isConnecting = false;

    mongoose.connection.on('error', (err) => {
      console.error(`[DB-RUNTIME-ERROR] MongoDB encountered an error:`, err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[DB-WARN] MongoDB disconnected from ${maskUri(uri)}`);
    });

    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`[DB-FATAL] Failed to connect to MongoDB (${maskUri(uri)}): ${error.message}`);
    throw error;
  }
};

const getDbDiagnostics = () => {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const state = states[mongoose.connection.readyState] || 'Unknown';
  return {
    state,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    target: maskUri(process.env.MONGODB_URI),
  };
};

module.exports = { connectDB, maskUri, getDbDiagnostics };
