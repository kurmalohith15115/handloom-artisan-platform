const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getArtisanOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  trackOrderByNumber,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Public tracking
router.get('/track/:orderNumber', trackOrderByNumber);

// Protected order routes
router.post('/', protect, restrictTo('customer'), createOrder);
router.get('/my-orders', protect, restrictTo('customer'), getMyOrders);
router.get('/artisan-orders', protect, restrictTo('artisan'), getArtisanOrders);
router.get('/all-orders', protect, restrictTo('admin'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, restrictTo('artisan', 'admin'), updateOrderStatus);
router.post('/:id/cancel', protect, cancelOrder);

module.exports = router;
