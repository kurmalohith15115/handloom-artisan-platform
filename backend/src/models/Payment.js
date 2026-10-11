const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    provider: {
      type: String,
      default: 'razorpay',
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    refundId: {
      type: String,
    },
    errorDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
    webhookEvents: [
      {
        event: String,
        payload: mongoose.Schema.Types.Mixed,
        receivedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
