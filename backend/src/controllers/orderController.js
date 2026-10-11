const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ArtisanProfile = require('../models/ArtisanProfile');
const { razorpay, getPaymentConfigStatus } = require('../config/razorpay');

/**
 * Valid state transitions map
 */
const ALLOWED_TRANSITIONS = {
  'Pending Payment': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Processing', 'Cancelled'],
  'Processing': ['Shipped', 'Cancelled'],
  'Shipped': ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered'],
  'Delivered': ['Refund Pending'],
  'Cancelled': [],
  'Refund Pending': ['Refunded'],
  'Refunded': [],
};

/**
 * Create Order & initialize Razorpay payment order
 * Strictly validates prices and stock on the server!
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required.',
      });
    }

    let orderItems = [];

    // If items not provided, load from user's Cart
    if (!items || items.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your cart is empty. Add items before checking out.',
        });
      }
      orderItems = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));
    } else {
      orderItems = items;
    }

    // Server-side validation of stock & prices
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product).populate('artisan');
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found for ID ${item.product}`,
        });
      }

      if (!product.isPublished || !product.isApprovedByAdmin) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.title}" is currently unavailable.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.stock}.`,
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        artisan: product.artisan._id,
        title: product.title,
        price: product.price, // Server price strictly enforced
        quantity: item.quantity,
        image: product.images[0] || '',
        material: product.material || '',
      });
    }

    // Delivery charge & tax rules
    const shippingFee = calculatedSubtotal >= 1999 ? 0 : 99; // Free shipping above ₹1999
    const tax = 0; // Handloom exempt/included
    const totalAmount = calculatedSubtotal + shippingFee + tax;

    const orderNumber = `HLO-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Order in Pending Payment status
    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      items: validatedItems,
      shippingAddress,
      subtotal: calculatedSubtotal,
      shippingFee,
      tax,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'Pending Payment',
      cancelEligibleUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24hr cancellation window
      statusHistory: [
        {
          status: 'Pending Payment',
          note: 'Order placed, awaiting payment confirmation',
          timestamp: new Date(),
          updatedBy: req.user._id,
        },
      ],
    });

    // Create Razorpay order (amount in paise, e.g. INR 500 = 50000 paise)
    const razorpayOptions = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        customerEmail: req.user.email,
      },
    };

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create(razorpayOptions);
    } catch (err) {
      console.error('[RAZORPAY-ORDER-CREATE-ERROR]', err);
      return res.status(500).json({
        success: false,
        message: 'Could not initialize payment gateway order.',
        error: err.message,
      });
    }

    // Save pending payment record
    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: totalAmount,
      currency: 'INR',
      razorpayOrderId: rzpOrder.id,
      status: 'created',
    });

    order.paymentRef = payment._id;
    await order.save();

    const paymentConfig = getPaymentConfigStatus();

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Proceed to payment.',
      order,
      razorpayOrder: {
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: paymentConfig.keyId,
        orderNumber: order.orderNumber,
        isSimulated: !paymentConfig.isRealConfigured,
        paymentMode: paymentConfig.mode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer Orders List
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'title images craftOrigin');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Order Details by ID (Strict ownership verification)
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'title images craftOrigin material')
      .populate({
        path: 'items.artisan',
        select: 'craftType location',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('paymentRef');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Permission check
    const isCustomerOwner = req.user.role === 'customer' && order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    let isArtisanOwner = false;
    if (req.user.role === 'artisan') {
      const profile = await ArtisanProfile.findOne({ user: req.user._id });
      if (profile) {
        isArtisanOwner = order.items.some(
          (item) => item.artisan && item.artisan._id.toString() === profile._id.toString()
        );
      }
    }

    if (!isCustomerOwner && !isAdmin && !isArtisanOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this order.',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Artisan Orders List
 */
const getArtisanOrders = async (req, res, next) => {
  try {
    const profile = await ArtisanProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Artisan profile not found' });
    }

    // Orders where at least one item belongs to this artisan
    const orders = await Order.find({
      'items.artisan': profile._id,
      paymentStatus: { $in: ['paid', 'partially_refunded'] }, // Only confirmed paid orders
    })
      .sort({ createdAt: -1 })
      .populate('customer', 'name email phone');

    // Filter items in each order to display the ones relevant to this artisan
    const artisanFilteredOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.artisanItems = orderObj.items.filter(
        (i) => i.artisan.toString() === profile._id.toString()
      );
      orderObj.artisanTotal = orderObj.artisanItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      return orderObj;
    });

    res.status(200).json({
      success: true,
      count: artisanFilteredOrders.length,
      orders: artisanFilteredOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all orders across platform
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search.trim(), $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .populate('customer', 'name email phone')
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Order Fulfillment Status
 * Artisans can only transition between fulfillment states.
 * Artisans CANNOT alter payment status or mark orders as paid!
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber, carrier } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role checks
    if (req.user.role === 'artisan') {
      const allowedArtisanStatuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
      if (!allowedArtisanStatuses.includes(status)) {
        return res.status(403).json({
          success: false,
          message: `Artisans may only set fulfillment stages: ${allowedArtisanStatuses.join(', ')}. Artisans cannot alter payment status.`,
        });
      }
    }

    // Validate lifecycle transition
    const allowedNext = ALLOWED_TRANSITIONS[order.orderStatus] || [];
    if (!allowedNext.includes(status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Invalid order status transition from "${order.orderStatus}" to "${status}". Allowed: ${allowedNext.join(', ')}`,
      });
    }

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;

    order.statusHistory.push({
      status,
      note: note || `Order status updated to ${status}`,
      timestamp: new Date(),
      updatedBy: req.user._id,
    });

    await order.save();

    // Create notification for customer
    await Notification.create({
      recipient: order.customer,
      role: 'customer',
      title: `Order Update: ${status}`,
      message: `Your order #${order.orderNumber} is now ${status}. ${trackingNumber ? `Tracking: ${carrier || ''} ${trackingNumber}` : ''}`,
      link: `/account/orders/${order._id}`,
      type: 'order',
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer cancel order
 * Restores product inventory!
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order' });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus}.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    if (order.paymentStatus === 'paid') {
      order.orderStatus = 'Refund Pending';
      order.paymentStatus = 'refund_pending';
    }

    order.statusHistory.push({
      status: order.orderStatus,
      note: `Cancelled: ${order.cancellationReason}`,
      timestamp: new Date(),
      updatedBy: req.user._id,
    });

    await order.save();

    // Restore inventory stock for cancelled order items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. Stock has been restored.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public Track Order by Order Number
 */
const trackOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).select(
      'orderNumber orderStatus paymentStatus statusHistory trackingNumber carrier items createdAt'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found with the provided order number.',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getArtisanOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  trackOrderByNumber,
};
