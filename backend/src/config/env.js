const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  const warnings = [];
  const errors = [];

  if (!process.env.MONGODB_URI && !isTest) {
    errors.push('MONGODB_URI is required. Please set it in your .env or platform variables.');
  }

  if (!process.env.JWT_SECRET) {
    if (isProduction) {
      errors.push('JWT_SECRET must be explicitly configured in production.');
    } else {
      warnings.push('JWT_SECRET not set; falling back to a development secret. DO NOT USE IN PRODUCTION.');
      process.env.JWT_SECRET = 'dev_jwt_secret_handloom_artisan_platform_2026_super_secure';
    }
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    warnings.push('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment gateway will operate in simulated test/mock mode.');
  }

  if (warnings.length > 0) {
    console.warn('\n--- [ENVIRONMENT CONFIGURATION NOTICE] ---');
    warnings.forEach((w) => console.warn(`⚠ ${w}`));
    console.warn('-------------------------------------------\n');
  }

  if (errors.length > 0 && !isTest) {
    console.error('\n--- [CRITICAL ENVIRONMENT CONFIGURATION ERRORS] ---');
    errors.forEach((e) => console.error(`✖ ${e}`));
    console.error('---------------------------------------------------\n');
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return {
    PORT: process.env.PORT || 5001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  };
};

module.exports = { validateEnv };
