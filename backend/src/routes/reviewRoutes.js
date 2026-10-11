const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  moderateReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, restrictTo('customer'), createReview);
router.put('/:id/moderate', protect, restrictTo('admin'), moderateReview);

module.exports = router;
