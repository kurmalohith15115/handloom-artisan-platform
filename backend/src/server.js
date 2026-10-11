const { validateEnv } = require('./config/env');
const { connectDB } = require('./config/db');

// Validate environment variables first
const config = validateEnv();

const app = require('./app');

const PORT = config.PORT || 5001;

let server;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`\n========================================================`);
      console.log(`  Handloom Artisan Support Platform — API Server`);
      console.log(`  Environment : ${config.NODE_ENV}`);
      console.log(`  Port        : ${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`========================================================\n`);
    });
  } catch (error) {
    console.error('[SERVER-START-FATAL] Server startup failed:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n[SHUTDOWN] Received ${signal}. Closing server gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[SHUTDOWN] HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
