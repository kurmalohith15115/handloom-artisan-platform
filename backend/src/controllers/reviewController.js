const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ArtisanProfile = require('../models/ArtisanProfile');

/**
 * Submit Product Review
 * Strictly verifies that customer actually purchased this product in a paid order!
 */
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment, photos } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, rating (1-5), and comment are required.',
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    // Verify purchase
    const eligibleOrder = await Order.findOne({
      customer: req.user._id,
      paymentStatus: 'paid',
      'items.product': productId,
    });

    if (!eligibleOrder) {
      return res.status(403).json({
        success: false,
        message: 'Verified Purchase Required: You can only review products you have purchased.',
      });
    }

    // Check if already reviewed for this order
    const existingReview = await Review.findOne({
      product: productId,
      customer: req.user._id,
      order: eligibleOrder._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this purchase.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = await Review.create({
      product: productId,
      customer: req.user._id,
      artisan: product.artisan,
      order: eligibleOrder._id,
      rating: numRating,
      comment,
      photos: photos || [],
      isApproved: true,
    });

    // Recalculate average rating for product
    const allProductReviews = await Review.find({ product: productId, isApproved: true });
    const avgRating =
      allProductReviews.reduce((sum, r) => sum + r.rating, 0) / (allProductReviews.length || 1);

    product.rating = parseFloat(avgRating.toFixed(1));
    product.numReviews = allProductReviews.length;
    await product.save();

    // Recalculate artisan average rating
    const allArtisanReviews = await Review.find({ artisan: product.artisan, isApproved: true });
    const artisanAvgRating =
      allArtisanReviews.reduce((sum, r) => sum + r.rating, 0) / (allArtisanReviews.length || 1);

    await ArtisanProfile.findByIdAndUpdate(product.artisan, {
      rating: parseFloat(artisanAvgRating.toFixed(1)),
      totalReviews: allArtisanReviews.length,
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for a specific product
 */
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Moderate review (Admin only)
 */
const moderateReview = async (req, res, next) => {
  try {
    const { isApproved, isReported, reportReason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (isApproved !== undefined) review.isApproved = isApproved;
    if (isReported !== undefined) review.isReported = isReported;
    if (reportReason !== undefined) review.reportReason = reportReason;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review moderation updated',
      review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  moderateReview,
};
