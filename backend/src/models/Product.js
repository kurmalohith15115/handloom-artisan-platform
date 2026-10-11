const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
      required: [true, 'Artisan profile reference is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least ₹1'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Available stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 1,
    },
    material: {
      type: String,
      required: [true, 'Material composition is required'],
      trim: true,
    },
    dimensions: {
      type: String,
      trim: true,
      default: '',
    },
    craftOrigin: {
      type: String,
      required: [true, 'Craft origin village/district/state is required'],
      trim: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one product image is required',
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.index({ title: 'text', description: 'text', craftOrigin: 'text' });
productSchema.index({ category: 1, isPublished: 1, isApprovedByAdmin: 1 });
productSchema.index({ artisan: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
