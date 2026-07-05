const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ArtisanProfile = require('../models/artisanProfile');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyforhandloomplatform', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Customer or Artisan)
router.post('/register', async (req, res) => {
  const { username, email, password, role, shopName, location, contactNumber, bio } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }

    // Set initial status based on role
    const initialStatus = role === 'artisan' ? 'pending_approval' : 'approved';

    // Create User
    const user = new User({
      username,
      email,
      password,
      role: role || 'customer',
      status: initialStatus
    });

    await user.save();

    // If artisan, create profile
    if (role === 'artisan') {
      if (!shopName || !location || !contactNumber) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Artisans must provide Shop Name, Location, and Contact Number.'
        });
      }

      const artisanProfile = new ArtisanProfile({
        user: user._id,
        shopName,
        location,
        contactNumber,
        bio: bio || '',
        photoUrl: '/uploads/default-avatar.svg'
      });

      await artisanProfile.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials.' });
    }

    // Check for user
    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Blocked check
    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by an administrator.' });
    }

    const token = generateToken(user._id);

    // Get artisan profile details if user is artisan
    let shopName = '';
    if (user.role === 'artisan') {
      const profile = await ArtisanProfile.findOne({ user: user._id });
      if (profile) {
        shopName = profile.shopName;
      }
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        shopName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user details
router.get('/me', protect, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'artisan') {
      profile = await ArtisanProfile.findOne({ user: req.user._id });
    }
    
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching user details.' });
  }
});

module.exports = router;
