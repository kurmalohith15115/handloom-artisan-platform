const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyArtisanProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { restrictTo, requireApprovedArtisan } = require('../middleware/role');

// Public catalog routes
router.get('/', getProducts);
router.get('/my/artisan-products', protect, restrictTo('artisan'), getMyArtisanProducts);
router.get('/:id', getProductById);

// Artisan / Admin routes
router.post('/', protect, restrictTo('artisan'), requireApprovedArtisan, createProduct);
router.put('/:id', protect, restrictTo('artisan', 'admin'), updateProduct);
router.delete('/:id', protect, restrictTo('artisan', 'admin'), deleteProduct);

module.exports = router;
