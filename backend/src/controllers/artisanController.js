const ArtisanProfile = require('../models/ArtisanProfile');
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * Public directory of approved artisans
 */
const getArtisans = async (req, res, next) => {
  try {
    const { craftType, state, search } = req.query;
    const query = { applicationStatus: 'approved' };

    if (craftType) {
      query.craftType = { $regex: craftType, $options: 'i' };
    }

    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    const artisans = await ArtisanProfile.find(query)
      .populate('user', 'name avatar')
      .sort({ rating: -1, totalSales: -1 });

    // Optional text search filter
    let filtered = artisans;
    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      filtered = artisans.filter(
        (a) =>
          (a.user && a.user.name.toLowerCase().includes(term)) ||
          a.craftType.toLowerCase().includes(term) ||
          (a.location.state && a.location.state.toLowerCase().includes(term)) ||
          (a.location.village && a.location.village.toLowerCase().includes(term))
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      artisans: filtered,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public Artisan Profile details & their products
 */
const getArtisanById = async (req, res, next) => {
  try {
    const artisan = await ArtisanProfile.findById(req.params.id).populate('user', 'name avatar createdAt');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found',
      });
    }

    // Fetch published products by this artisan
    const products = await Product.find({
      artisan: artisan._id,
      isPublished: true,
      isApprovedByAdmin: true,
    }).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      artisan,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current artisan's own profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await ArtisanProfile.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found for this account',
      });
    }

    res.status(200).json({
      success: true,
      artisanProfile: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current artisan's own profile
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await ArtisanProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found',
      });
    }

    const {
      craftType,
      craftStory,
      experienceYears,
      location,
      profilePhoto,
      workshopPhotos,
      bankDetails,
    } = req.body;

    if (craftType) profile.craftType = craftType;
    if (craftStory) profile.craftStory = craftStory;
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (location) profile.location = { ...profile.location, ...location };
    if (profilePhoto !== undefined) profile.profilePhoto = profilePhoto;
    if (workshopPhotos !== undefined) profile.workshopPhotos = workshopPhotos;
    if (bankDetails) profile.bankDetails = { ...profile.bankDetails, ...bankDetails };

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Artisan profile updated successfully',
      artisanProfile: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get artisan dashboard stats & earnings
 */
const getArtisanStats = async (req, res, next) => {
  try {
    const profile = await ArtisanProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Artisan profile not found' });
    }

    const [totalProducts, orders] = await Promise.all([
      Product.countDocuments({ artisan: profile._id }),
      Order.find({ 'items.artisan': profile._id, paymentStatus: 'paid' }),
    ]);

    let totalEarnings = 0;
    let itemsSold = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.artisan && item.artisan.toString() === profile._id.toString()) {
          totalEarnings += item.price * item.quantity;
          itemsSold += item.quantity;
        }
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        applicationStatus: profile.applicationStatus,
        totalProducts,
        totalOrders: orders.length,
        itemsSold,
        totalEarnings,
        rating: profile.rating,
        totalReviews: profile.totalReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArtisans,
  getArtisanById,
  getMyProfile,
  updateMyProfile,
  getArtisanStats,
};
