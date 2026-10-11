const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  registerArtisan,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register-customer', authLimiter, registerCustomer);
router.post('/register-artisan', authLimiter, registerArtisan);
router.post('/login', authLimiter, login);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
