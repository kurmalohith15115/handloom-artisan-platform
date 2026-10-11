const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  replyTicket,
} = require('../controllers/supportController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Public or customer submission
router.post('/', (req, res, next) => {
  // Optional auth
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, createTicket);

// Customer/Artisan my tickets
router.get('/my-tickets', protect, getMyTickets);

// Admin ticket management
router.get('/all-tickets', protect, restrictTo('admin'), getAllTickets);
router.post('/:id/reply', protect, replyTicket);

module.exports = router;
