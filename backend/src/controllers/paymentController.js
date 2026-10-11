const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const ArtisanProfile = require('../models/ArtisanProfile');
const {
  verifyPaymentSignature,
  verifyWebhookSignature,
  getPaymentConfigStatus,
} = require('../config/razorpay');

/**
 * Verify Razorpay Payment Signature
 * Server-side payment verification strictly enforced!
 */
const verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification credentials: orderId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    const order = await Order.findById(orderId).populate('customer');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found' });
    }

    // Prevent duplicate processing
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and confirmed for this order.',
        order,
      });
    }

    // Cryptographic signature check
    const isValid = verifyPaymentSignature({
      order_id: razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      // Record payment failure
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: 'failed',
          razorpayPaymentId: razorpay_payment_id,
          errorDetails: 'Cryptographic signature verification failed',
        }
      );

      order.paymentStatus = 'failed';
      order.statusHistory.push({
        status: 'Pending Payment',
        note: 'Payment signature verification failed',
        timestamp: new Date(),
        updatedBy: req.user._id,
      });
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic payment signature.',
      });
    }

    // Update payment record to captured
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
      },
      { returnDocument: 'after' }
    );

    // Update order status
    order.paymentStatus = 'paid';
    order.orderStatus = 'Confirmed';
    order.paymentRef = payment ? payment._id : order.paymentRef;
    order.statusHistory.push({
      status: 'Confirmed',
      note: `Payment captured successfully via Razorpay (Payment ID: ${razorpay_payment_id})`,
      timestamp: new Date(),
      updatedBy: req.user._id,
    });
    await order.save();

    // Deduct stock and update artisan earnings
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });

      if (item.artisan) {
        await ArtisanProfile.findByIdAndUpdate(item.artisan, {
          $inc: {
            totalSales: item.quantity,
            earnings: item.price * item.quantity,
          },
        });

        // Notify Artisan of new confirmed order
        const artisanProf = await ArtisanProfile.findById(item.artisan);
        if (artisanProf && artisanProf.user) {
          await Notification.create({
            recipient: artisanProf.user,
            role: 'artisan',
            title: 'New Order Received!',
            message: `Order #${order.orderNumber} placed for ${item.quantity}x ${item.title}.`,
            link: `/artisan/dashboard/orders`,
            type: 'order',
          });
        }
      }
    }

    // Clear customer's shopping cart
    await Cart.findOneAndUpdate({ user: order.customer._id }, { items: [] });

    // Notify Customer
    await Notification.create({
      recipient: order.customer._id,
      role: 'customer',
      title: 'Order Confirmed!',
      message: `Your payment of ₹${order.totalAmount} for order #${order.orderNumber} was successful.`,
      link: `/account/orders/${order._id}`,
      type: 'order',
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      order,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook handler for asynchronous Razorpay events
 * Idempotent with signature check
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = JSON.stringify(req.body);

    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const rzpOrderId = paymentEntity.order_id;

      const payment = await Payment.findOne({ razorpayOrderId: rzpOrderId });
      if (payment && payment.status !== 'captured') {
        payment.status = 'captured';
        payment.razorpayPaymentId = paymentEntity.id;
        payment.webhookEvents.push({ event, payload, receivedAt: new Date() });
        await payment.save();

        const order = await Order.findById(payment.order);
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.orderStatus = 'Confirmed';
          order.statusHistory.push({
            status: 'Confirmed',
            note: 'Confirmed via Razorpay Webhook',
            timestamp: new Date(),
          });
          await order.save();
        }
      }
    }

    res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public payment configuration
 */
const getPaymentConfig = (req, res) => {
  const config = getPaymentConfigStatus();
  res.status(200).json({
    success: true,
    ...config,
  });
};

module.exports = {
  verifyPayment,
  handleWebhook,
  getPaymentConfig,
};
