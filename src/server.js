
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Load models
const User = require('./models/user');
require('./models/artisanProfile');
require('./models/product');
require('./models/order');
require('./models/review');

const app = express();

// Connect to MongoDB and create the admin account if it doesn't exist
async function initializeApplication() {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = (
    process.env.ADMIN_USERNAME || 'admin'
  ).trim();

  if (!adminEmail || !adminPassword) {
    console.log(
      'Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD is not configured.'
    );
    return;
  }

  if (!adminUsername) {
    throw new Error('ADMIN_USERNAME cannot be empty.');
  }

  const existingAdmin = await User.findOne({
    email: adminEmail
  });

  if (existingAdmin) {
    // Do not overwrite an existing account or change its role/password.
    console.log(
      'Admin bootstrap: configured email already exists; no changes made.'
    );
    return;
  }

  const existingUsername = await User.findOne({
    username: adminUsername
  });

  if (existingUsername) {
    throw new Error(
      'ADMIN_USERNAME is already in use. Configure a unique username.'
    );
  }

  const admin = new User({
    username: adminUsername,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    status: 'approved'
  });

  await admin.save();

  console.log('Admin bootstrap: created configured admin account.');
}

// Express middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if needed
const uploadDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/artisans', require('./routes/artisans'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Fallback for page routes
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'API Endpoint not found.'
    });
  }

  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server only after initialization succeeds
const PORT = process.env.PORT || 5001;

initializeApplication()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error('Application startup failed:', error.message);
    process.exit(1);
  });
