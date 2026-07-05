require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Models (loaded so mongoose handles registration)
require('./models/user');
require('./models/artisanProfile');
require('./models/product');
require('./models/order');
require('./models/review');

// Initialize app
const app = express();

// Connect Database
connectDB();

// Express Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create public upload directory if it does not exist
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve Static Files
app.use(express.static(path.join(__dirname, '../public')));

// Define Route Paths
app.use('/api/auth', require('./routes/auth'));
app.use('/api/artisans', require('./routes/artisans'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Fallback for HTML routing (cleaner URLs)
app.get('*', (req, res, next) => {
  // If request wants API, return 404 json
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Endpoint not found.' });
  }
  // Otherwise, let static serve or return index.html
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Port configuration
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
