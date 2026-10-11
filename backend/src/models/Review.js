const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Verified purchase order reference is required to submit a review'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating (1 to 5) is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [5, 'Comment must be at least 5 characters long'],
    },
    photos: [
      {
        type: String,
      },
    ],
    isApproved: {
      type: Boolean,
      default: true,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One review per customer per purchased product per order
reviewSchema.index({ product: 1, customer: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ artisan: 1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
