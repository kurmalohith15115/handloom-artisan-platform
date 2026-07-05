const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforhandloomplatform');

      // Fetch user and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found. Not authorized.' });
      }

      if (req.user.status === 'blocked') {
        return res.status(403).json({ success: false, message: 'Your account has been blocked by an administrator.' });
      }

      next();
    } catch (error) {
      console.error('JWT auth middleware error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token validation failed.' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no session token found.' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource.`
      });
    }
    
    // Artisans must be approved to access write / update operations
    if (req.user.role === 'artisan' && req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your artisan account is pending administrator approval.'
      });
    }

    next();
  };
};

module.exports = { protect, restrictTo };
