const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Get current user's cart
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title price originalPrice stock images craftOrigin material artisan isPublished isApprovedByAdmin',
      populate: {
        path: 'artisan',
        select: 'craftType location',
        populate: { path: 'user', select: 'name' },
      },
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items where product was deleted or unpublished
    const validItems = cart.items.filter(
      (item) => item.product && item.product.isPublished && item.product.isApprovedByAdmin
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product ? item.product.price : item.priceAtAddition;
      return sum + price * item.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      cart,
      subtotal,
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isPublished || !product.isApprovedByAdmin) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
    }

    const qtyToAdd = Math.max(1, parseInt(quantity, 10));

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qtyToAdd;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} units are currently available in stock.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].priceAtAddition = product.price;
    } else {
      if (qtyToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units are available in stock.`,
        });
      }
      cart.items.push({
        product: product._id,
        quantity: qtyToAdd,
        priceAtAddition: product.price,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    const newQty = parseInt(quantity, 10);
    if (newQty <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        cart.items.splice(itemIndex, 1);
      } else if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock.`,
        });
      } else {
        cart.items[itemIndex].quantity = newQty;
      }
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
