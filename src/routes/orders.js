const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/order');
const Product = require('../models/product');
const ArtisanProfile = require('../models/artisanProfile');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

let razorpayInstance = null;
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (keyId && keySecret) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log('Razorpay Gateway initialized successfully in backend.');
  } catch (err) {
    console.error('Error initializing Razorpay: ', err);
  }
} else {
  console.log('Razorpay credentials missing. Running in payment simulation mode.');
}

// @route   POST /api/orders
// @desc    Create a new order & initiate Razorpay order
// @access  Private (Customer only)
router.post('/', protect, restrictTo('customer'), async (req, res) => {
  try {
    const { products, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    // Validate stock and compute total price
    let totalAmount = 0;
    const verifiedProducts = [];

    for (const item of products) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product ${item.title} not found.` });
      }
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${dbProduct.title}". Only ${dbProduct.stock} left.`
        });
      }
      
      const itemCost = dbProduct.price * item.quantity;
      totalAmount += itemCost;
      verifiedProducts.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: dbProduct.price
      });
    }

    let razorpayOrderId = '';
    let isSandbox = true;

    if (razorpayInstance) {
      // Real Razorpay order creation
      const options = {
        amount: Math.round(totalAmount * 100), // amount in paisa
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`
      };

      const rpOrder = await razorpayInstance.orders.create(options);
      razorpayOrderId = rpOrder.id;
      isSandbox = false;
    } else {
      // Sandbox mode: create a mock Razorpay ID
      razorpayOrderId = `order_mock_${Date.now()}_${Math.round(Math.random() * 1000)}`;
    }

    // Create order in DB with status pending
    const order = new Order({
      customer: req.user._id,
      products: verifiedProducts,
      totalAmount,
      razorpayOrderId,
      paymentStatus: 'Pending',
      shippingAddress,
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();

    res.status(201).json({
      success: true,
      orderId: order._id,
      razorpayOrderId,
      amount: totalAmount,
      keyId: keyId || 'sandbox_key',
      isSandbox
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Server error creating order.' });
  }
});

// @route   POST /api/orders/verify
// @desc    Verify Razorpay payment signature or verify Sandbox simulation
// @access  Private (Customer only)
router.post('/verify', protect, restrictTo('customer'), async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, isSandbox } = req.body;

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found.' });
    }

    let verified = false;

    if (isSandbox || !razorpayInstance) {
      // Validate simulated payment
      verified = true;
      order.paymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
      order.paymentStatus = 'Paid';
    } else {
      // Real Razorpay Signature Verification
      const text = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(text.toString())
        .digest('hex');

      if (expectedSignature === razorpaySignature) {
        verified = true;
        order.paymentId = razorpayPaymentId;
        order.paymentStatus = 'Paid';
      }
    }

    if (verified) {
      // Deduct stock for all purchased products
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
      await order.save();
      res.json({ success: true, message: 'Payment verified and order placed successfully!', orderId: order._id });
    } else {
      order.paymentStatus = 'Failed';
      await order.save();
      res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment.' });
  }
});

// @route   GET /api/orders/customer
// @desc    Get customer orders history
// @access  Private (Customer only)
router.get('/customer', protect, restrictTo('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate({
        path: 'products.product',
        select: 'title price imageUrl'
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Fetch customer orders error:', error);
    res.status(500).json({ success: false, message: 'Server error listing orders.' });
  }
});

// @route   GET /api/orders/artisan
// @desc    Get artisan orders list (orders containing their products)
// @access  Private (Artisan only)
router.get('/artisan', protect, restrictTo('artisan'), async (req, res) => {
  try {
    // Find products made by this artisan
    const artisanProducts = await Product.find({ artisan: req.user._id }).select('_id');
    const productIds = artisanProducts.map(p => p._id);

    // Find orders with these products
    const orders = await Order.find({ 'products.product': { $in: productIds } })
      .populate({
        path: 'products.product',
        select: 'title price imageUrl artisan'
      })
      .populate('customer', 'username email')
      .sort({ createdAt: -1 });

    // Filter order items to show only relevant products to the artisan
    const formattedOrders = orders.map(order => {
      const orderObj = typeof order.toObject === 'function' ? order.toObject() : { ...order };
      orderObj.artisanItems = orderObj.products.filter(
        item => item.product && item.product.artisan.toString() === req.user._id.toString()
      );
      orderObj.artisanTotal = orderObj.artisanItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return orderObj;
    });

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error('Fetch artisan orders error:', error);
    res.status(500).json({ success: false, message: 'Server error listing artisan orders.' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Artisan or Admin)
router.put('/:id/status', protect, restrictTo('artisan', 'admin'), async (req, res) => {
  try {
    const { status, estimatedDelivery } = req.body;
    
    if (!['Pending', 'Processing', 'Shipped', 'Delivered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status state.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.orderStatus = status;
    if (estimatedDelivery) {
      order.estimatedDeliveryDate = new Date(estimatedDelivery);
    }
    
    await order.save();
    res.json({ success: true, message: 'Order status updated successfully.', data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error changing status.' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details for tracking
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'products.product',
        select: 'title price imageUrl'
      })
      .populate('customer', 'username email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Decorate with shop details
    const productsDecorated = await Promise.all(order.products.map(async (item) => {
      const itemObj = typeof item.toObject === 'function' ? item.toObject() : { ...item };
      if (item.product) {
        const artisanProfile = await ArtisanProfile.findOne({ user: item.product.artisan });
        itemObj.shopName = artisanProfile ? artisanProfile.shopName : 'Handloom Artisan';
      }
      return itemObj;
    }));

     const orderObj = typeof order.toObject === 'function' ? order.toObject() : { ...order };
    orderObj.products = productsDecorated;

    res.json({ success: true, data: orderObj });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: 'Server error loading tracker details.' });
  }
});

module.exports = router;
