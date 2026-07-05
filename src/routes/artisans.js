const express = require('express');
const User = require('../models/user');
const ArtisanProfile = require('../models/artisanProfile');
const Product = require('../models/product');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

// @route   GET /api/artisans
// @desc    Get all approved artisans
router.get('/', async (req, res) => {
  try {
    // Find all users who are artisans and approved
    const approvedUsers = await User.find({ role: 'artisan', status: 'approved' }).select('_id');
    const userIds = approvedUsers.map(u => u._id);

    // Get profiles for these users
    const profiles = await ArtisanProfile.find({ user: { $in: userIds } }).populate('user', 'username email');
    res.json({ success: true, count: profiles.length, data: profiles });
  } catch (error) {
    console.error('Fetch artisans error:', error);
    res.status(500).json({ success: false, message: 'Server error listing artisans.' });
  }
});

// @route   GET /api/artisans/:id
// @desc    Get artisan profile & their products by User ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user || user.role !== 'artisan') {
      return res.status(404).json({ success: false, message: 'Artisan not found.' });
    }

    const profile = await ArtisanProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Artisan profile does not exist.' });
    }

    // Get products of this artisan
    const products = await Product.find({ artisan: userId, status: 'active' });

    res.json({
      success: true,
      data: {
        user,
        profile,
        products
      }
    });
  } catch (error) {
    console.error('Fetch artisan detail error:', error);
    res.status(500).json({ success: false, message: 'Server error loading artisan profile.' });
  }
});

// @route   PUT /api/artisans/profile
// @desc    Update current logged-in artisan profile
// @access  Private (Artisan only)
router.put('/profile', protect, restrictTo('artisan'), upload.single('photo'), async (req, res) => {
  try {
    const { shopName, bio, location, contactNumber } = req.body;
    
    let profile = await ArtisanProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Artisan profile not found.' });
    }

    // Update fields
    if (shopName) profile.shopName = shopName;
    if (bio !== undefined) profile.bio = bio;
    if (location) profile.location = location;
    if (contactNumber) profile.contactNumber = contactNumber;
    
    if (req.file) {
      // Photo uploaded
      profile.photoUrl = `/uploads/${req.file.filename}`;
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile
    });
  } catch (error) {
    console.error('Update artisan profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

module.exports = router;
