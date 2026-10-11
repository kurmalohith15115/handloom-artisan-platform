const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArtisanProfile',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    default: '',
  },
  material: {
    type: String,
    default: '',
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending Payment',
        'Confirmed',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Refund Pending',
        'Refunded',
      ],
      default: 'Pending Payment',
    },
    statusHistory: [statusHistorySchema],
    paymentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    carrier: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelEligibleUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'items.artisan': 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
