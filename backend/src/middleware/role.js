const ArtisanProfile = require('../models/ArtisanProfile');

/**
 * Restricts access to specific user roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires [${roles.join(', ')}] role, but you are logged in as [${req.user.role}].`,
      });
    }

    next();
  };
};

/**
 * Middleware ensuring artisan is fully approved before creating products
 */
const requireApprovedArtisan = async (req, res, next) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access restricted to artisans only.',
      });
    }

    const profile = await ArtisanProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found. Please complete artisan registration.',
      });
    }

    if (profile.applicationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your artisan application status is "${profile.applicationStatus}". You can only list products once your application is approved by the admin.`,
        applicationStatus: profile.applicationStatus,
      });
    }

    req.artisanProfile = profile;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify artisan approval status',
      error: error.message,
    });
  }
};

module.exports = { restrictTo, requireApprovedArtisan };
