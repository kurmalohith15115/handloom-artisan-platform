const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getArtisanApplications,
  updateArtisanStatus,
  getAllUsers,
  toggleUserActiveStatus,
  moderateProduct,
  getAuditLogs,
  getSalesReports,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Strict protection: All routes in this file require Admin role
router.use(protect, restrictTo('admin'));

router.get('/metrics', getDashboardMetrics);
router.get('/artisan-applications', getArtisanApplications);
router.put('/artisan-applications/:id/status', updateArtisanStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserActiveStatus);
router.put('/products/:id/moderate', moderateProduct);
router.get('/audit-logs', getAuditLogs);
router.get('/reports/sales', getSalesReports);

module.exports = router;
