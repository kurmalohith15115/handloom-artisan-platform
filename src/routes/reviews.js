const express = require('express');
const Review = require('../models/review');
const Product = require('../models/product');
const ArtisanProfile = require('../models/artisanProfile');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   POST /api/reviews/:productId
// @desc    Add review to product
// @access  Private (Customer only)
router.post('/:productId', protect, restrictTo('customer'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide a rating and a comment.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if customer already reviewed this product
    const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    // Create Review
    const review = new Review({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment
    });

    await review.save();

    // Recalculate Product average rating
    const productReviews = await Review.find({ product: productId });
    const productReviewsCount = productReviews.length;
    const productAvgRating = productReviews.reduce((sum, item) => sum + item.rating, 0) / productReviewsCount;

    product.rating = Number(productAvgRating.toFixed(1));
    product.reviewsCount = productReviewsCount;
    await product.save();

    // Recalculate Artisan average rating based on all their products
    const artisanProducts = await Product.find({ artisan: product.artisan });
    const productRatings = artisanProducts.filter(p => p.reviewsCount > 0).map(p => p.rating);
    
    let artisanAvgRating = 0;
    let artisanReviewsCount = 0;

    const allArtisanReviews = await Review.find({ 
      product: { $in: artisanProducts.map(p => p._id) } 
    });
    
    if (allArtisanReviews.length > 0) {
      artisanReviewsCount = allArtisanReviews.length;
      artisanAvgRating = allArtisanReviews.reduce((sum, item) => sum + item.rating, 0) / artisanReviewsCount;
    }

    // Update Artisan Profile
    await ArtisanProfile.findOneAndUpdate(
      { user: product.artisan },
      { 
        rating: Number(artisanAvgRating.toFixed(1)), 
        reviewsCount: artisanReviewsCount 
      }
    );

    res.status(201).json({
      success: true,
      message: 'Review added successfully.',
      data: review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: 'Server error adding review.' });
  }
});

// @route   GET /api/reviews/:productId
// @desc    Get all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews.' });
  }
});

module.exports = router;
