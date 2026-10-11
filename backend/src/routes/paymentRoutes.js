const express = require('express');
const router = express.Router();
const {
  verifyPayment,
  handleWebhook,
  getPaymentConfig,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/config', getPaymentConfig);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
