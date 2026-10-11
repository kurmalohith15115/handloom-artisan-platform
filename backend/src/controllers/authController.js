const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');
const Cart = require('../models/Cart');

/**
 * Helper to generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Customer Registration
 * PUBLIC - role is strictly forced to 'customer'
 */
const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone, languagePreference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Role is strictly forced to 'customer' - never trust client input
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'customer',
      languagePreference: languagePreference === 'te' ? 'te' : 'en',
    });

    // Create empty cart for new customer
    await Cart.create({ user: user._id, items: [] });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Customer account created successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Artisan Registration
 * PUBLIC - role is strictly forced to 'artisan', artisan application is created with 'pending' status
 */
const registerArtisan = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      languagePreference,
      craftType,
      craftStory,
      experienceYears,
      location,
      profilePhoto,
      workshopPhotos,
      bankDetails,
    } = req.body;

    if (!name || !email || !password || !craftType || !craftStory) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, craft type, and craft story are required.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Strict role enforcement
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'artisan',
      languagePreference: languagePreference === 'te' ? 'te' : 'en',
    });

    const artisanProfile = await ArtisanProfile.create({
      user: user._id,
      craftType,
      craftStory,
      experienceYears: Number(experienceYears) || 0,
      location: location || { state: 'Telangana', country: 'India' },
      profilePhoto: profilePhoto || '',
      workshopPhotos: workshopPhotos || [],
      bankDetails: bankDetails || {},
      applicationStatus: 'pending', // Awaiting Admin Approval
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Artisan registration submitted successfully. Your application is pending administrator review.',
      token,
      user: user.toSafeObject(),
      artisanProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Universal Login with role verification
 */
const login = async (req, res, next) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify expected role if passed from specific portal (e.g. /admin/login requires admin)
    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized portal login. This portal is for ${expectedRole} accounts only. Your account is registered as ${user.role}.`,
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    let artisanProfile = null;
    if (user.role === 'artisan') {
      artisanProfile = await ArtisanProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toSafeObject(),
      artisanProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let artisanProfile = null;
    if (user.role === 'artisan') {
      artisanProfile = await ArtisanProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
      artisanProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, languagePreference, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (languagePreference) user.languagePreference = languagePreference;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCustomer,
  registerArtisan,
  login,
  getMe,
  updateProfile,
  changePassword,
};
