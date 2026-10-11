const express = require('express');
const router = express.Router();
const {
  getArtisans,
  getArtisanById,
  getMyProfile,
  updateMyProfile,
  getArtisanStats,
} = require('../controllers/artisanController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Public routes
router.get('/', getArtisans);
router.get('/profile/:id', getArtisanById);

// Artisan dashboard routes
router.get('/me', protect, restrictTo('artisan'), getMyProfile);
router.put('/me', protect, restrictTo('artisan'), updateMyProfile);
router.get('/stats', protect, restrictTo('artisan'), getArtisanStats);

module.exports = router;
