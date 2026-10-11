const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const SupportTicket = require('../models/SupportTicket');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

/**
 * Admin Dashboard Metrics & Totals
 * Real calculated numbers, never fabricated!
 */
const getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalArtisans,
      pendingArtisans,
      approvedArtisans,
      totalProducts,
      publishedProducts,
      outOfStockProducts,
      totalOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalReviews,
      openTickets,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'artisan' }),
      ArtisanProfile.countDocuments({ applicationStatus: 'pending' }),
      ArtisanProfile.countDocuments({ applicationStatus: 'approved' }),
      Product.countDocuments(),
      Product.countDocuments({ isPublished: true, isApprovedByAdmin: true }),
      Product.countDocuments({ stock: { $lte: 0 } }),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
      Review.countDocuments(),
      SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    ]);

    // Aggregate sales revenue from paid orders
    const salesAggregate = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalSalesRevenue = salesAggregate.length > 0 ? salesAggregate[0].totalRevenue : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email');

    // Pending artisan applications
    const pendingApplications = await ArtisanProfile.find({ applicationStatus: 'pending' })
      .limit(5)
      .populate('user', 'name email phone createdAt');

    res.status(200).json({
      success: true,
      metrics: {
        users: { total: totalUsers, customers: totalCustomers, artisans: totalArtisans },
        artisans: { total: totalArtisans, pending: pendingArtisans, approved: approvedArtisans },
        products: { total: totalProducts, published: publishedProducts, outOfStock: outOfStockProducts },
        orders: {
          total: totalOrders,
          paid: confirmedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        financials: { totalSalesRevenue },
        engagement: { reviews: totalReviews, openSupportTickets: openTickets },
      },
      recentOrders,
      pendingApplications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Artisan Applications with Status Filters
 */
const getArtisanApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.applicationStatus = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      ArtisanProfile.find(query)
        .populate('user', 'name email phone isActive createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ArtisanProfile.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve, Reject, Suspend, or Reactivate Artisan Application
 */
const updateArtisanStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ['approved', 'rejected', 'suspended', 'pending'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`,
      });
    }

    const artisan = await ArtisanProfile.findById(req.params.id).populate('user');
    if (!artisan) {
      return res.status(404).json({ success: false, message: 'Artisan profile not found' });
    }

    const previousStatus = artisan.applicationStatus;
    artisan.applicationStatus = status;
    if (rejectionReason !== undefined) artisan.rejectionReason = rejectionReason;
    await artisan.save();

    // Create Audit Log
    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: 'admin',
      action: `ARTISAN_STATUS_${status.toUpperCase()}`,
      targetModel: 'ArtisanProfile',
      targetId: artisan._id.toString(),
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
      details: { previousStatus, newStatus: status, rejectionReason },
    });

    // Notify Artisan
    if (artisan.user) {
      let title = `Artisan Application ${status.toUpperCase()}`;
      let message = `Your artisan application status has been updated to "${status}".`;
      if (status === 'approved') {
        message = 'Congratulations! Your artisan application has been approved. You can now list handloom products for sale.';
      } else if (status === 'rejected') {
        message = `Your artisan application was not approved. Reason: ${rejectionReason || 'Incomplete details'}`;
      }

      await Notification.create({
        recipient: artisan.user._id,
        role: 'artisan',
        title,
        message,
        link: '/artisan/dashboard',
        type: 'application',
      });
    }

    res.status(200).json({
      success: true,
      message: `Artisan application status updated to "${status}"`,
      artisan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with role and search filters
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users: users.map((u) => u.toSafeObject()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user active/suspended status
 */
const toggleUserActiveStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Administrators cannot deactivate themselves.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: 'admin',
      action: user.isActive ? 'USER_REACTIVATED' : 'USER_DEACTIVATED',
      targetModel: 'User',
      targetId: user._id.toString(),
      details: { newStatus: user.isActive },
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Moderate Product (approve/reject/toggle feature)
 */
const moderateProduct = async (req, res, next) => {
  try {
    const { isApprovedByAdmin, featured, isPublished } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (isApprovedByAdmin !== undefined) product.isApprovedByAdmin = Boolean(isApprovedByAdmin);
    if (featured !== undefined) product.featured = Boolean(featured);
    if (isPublished !== undefined) product.isPublished = Boolean(isPublished);

    await product.save();

    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      actorRole: 'admin',
      action: 'PRODUCT_MODERATION_UPDATED',
      targetModel: 'Product',
      targetId: product._id.toString(),
      details: { isApprovedByAdmin, featured, isPublished },
    });

    res.status(200).json({
      success: true,
      message: 'Product moderation updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, limit = 50 } = req.query;
    const query = {};
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sales Reports & Craft Analytics
 */
const getSalesReports = async (req, res, next) => {
  try {
    // Sales by craft origin
    const salesByOrigin = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.title',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Top artisans by sales
    const topArtisans = await ArtisanProfile.find({ applicationStatus: 'approved' })
      .sort({ totalSales: -1 })
      .limit(5)
      .populate('user', 'name');

    res.status(200).json({
      success: true,
      salesByOrigin,
      topArtisans,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
  getArtisanApplications,
  updateArtisanStatus,
  getAllUsers,
  toggleUserActiveStatus,
  moderateProduct,
  getAuditLogs,
  getSalesReports,
};
