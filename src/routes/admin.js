const express = require('express');
const User = require('../models/user');
const ArtisanProfile = require('../models/artisanProfile');
const Product = require('../models/product');
const Order = require('../models/order');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply admin guard to all routes
router.use(protect, restrictTo('admin'));

// @route   GET /api/admin/analytics
// @desc    Get dashboard counters, revenue metrics, and payment logs
router.get('/analytics', async (req, res) => {
  try {
    // Platform Revenue (from Paid orders)
    const paidOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Platform Counts
    const ordersCount = await Order.countDocuments();
    const customersCount = await User.countDocuments({ role: 'customer' });
    const artisansCount = await User.countDocuments({ role: 'artisan' });
    const pendingArtisansCount = await User.countDocuments({ role: 'artisan', status: 'pending_approval' });
    const productsCount = await Product.countDocuments();

    // Recent payments (Paid orders)
    const recentPayments = await Order.find({ paymentStatus: 'Paid' })
      .populate('customer', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        ordersCount,
        customersCount,
        artisansCount,
        pendingArtisansCount,
        productsCount,
        recentPayments
      }
    });
  } catch (error) {
    console.error('Fetch admin analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error loading analytics.' });
  }
});

// @route   GET /api/admin/artisans
// @desc    Get all registered artisans (including pending and blocked)
router.get('/artisans', async (req, res) => {
  try {
    const artisans = await User.find({ role: 'artisan' }).select('-password').sort({ createdAt: -1 });
    
    // Map with profile details
    const artisanList = await Promise.all(artisans.map(async (artisan) => {
      const profile = await ArtisanProfile.findOne({ user: artisan._id });
      return {
        _id: artisan._id,
        username: artisan.username,
        email: artisan.email,
        status: artisan.status,
        createdAt: artisan.createdAt,
        profile: profile || {}
      };
    }));

    res.json({ success: true, data: artisanList });
  } catch (error) {
    console.error('Fetch admin artisans error:', error);
    res.status(500).json({ success: false, message: 'Server error listing artisans.' });
  }
});

// @route   PUT /api/admin/artisans/:id/status
// @desc    Approve, unblock, or block an artisan
router.put('/artisans/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'blocked', 'pending_approval'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const artisan = await User.findById(req.params.id);
    if (!artisan || artisan.role !== 'artisan') {
      return res.status(404).json({ success: false, message: 'Artisan not found.' });
    }

    artisan.status = status;
    await artisan.save();

    // If blocked, set all their products to blocked as well
    if (status === 'blocked') {
      await Product.updateMany({ artisan: artisan._id }, { status: 'blocked' });
    } else if (status === 'approved') {
      // Restore products to active
      await Product.updateMany({ artisan: artisan._id }, { status: 'active' });
    }

    res.json({ success: true, message: `Artisan status updated to ${status} successfully.`, data: artisan });
  } catch (error) {
    console.error('Update artisan status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status.' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products (active and blocked)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('artisan', 'username email')
      .sort({ createdAt: -1 });

    const decoratedProducts = await Promise.all(products.map(async (p) => {
      const shop = await ArtisanProfile.findOne({ user: p.artisan._id });
      const pObj = typeof p.toObject === 'function' ? p.toObject() : { ...p };
      pObj.shopName = shop ? shop.shopName : 'Handloom Artisan';
      return pObj;
    }));

    res.json({ success: true, data: decoratedProducts });
  } catch (error) {
    console.error('Fetch admin products error:', error);
    res.status(500).json({ success: false, message: 'Server error listing products.' });
  }
});

// @route   PUT /api/admin/products/:id/status
// @desc    Block or activate a product
router.put('/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid product status.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.status = status;
    await product.save();

    res.json({ success: true, message: `Product is now ${status}.`, data: product });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status.' });
  }
});

// @route   GET /api/admin/customers
// @desc    Get all customer accounts
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Fetch admin customers error:', error);
    res.status(500).json({ success: false, message: 'Server error listing customers.' });
  }
});

// @route   PUT /api/admin/customers/:id/status
// @desc    Block or activate a customer account
router.put('/customers/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid customer status.' });
    }

    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    customer.status = status;
    await customer.save();

    res.json({ success: true, message: `Customer account is now ${status === 'blocked' ? 'blocked' : 'active'}.`, data: customer });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating customer.' });
  }
});

module.exports = router;
