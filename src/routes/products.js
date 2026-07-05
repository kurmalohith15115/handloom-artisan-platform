const express = require('express');
const Product = require('../models/product');
const ArtisanProfile = require('../models/artisanProfile');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

// @route   GET /api/products
// @desc    Get all active products with search/filters
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, artisanId, sort } = req.query;
    
    let query = { status: 'active' };

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Artisan
    if (artisanId) {
      query.artisan = artisanId;
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search term in Title or Description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    }

    // Find and populate artisan info
    const products = await Product.find(query)
      .populate({
        path: 'artisan',
        select: '_id username'
      })
      .sort(sortOption);

    // Fetch artisan profiles to map shopName
    const populatedProducts = await Promise.all(products.map(async (p) => {
      if (p.artisan) {
        const artisanProfile = await ArtisanProfile.findOne({ user: p.artisan._id });
        const productObj = typeof p.toObject === 'function' ? p.toObject() : { ...p };
        productObj.shopName = artisanProfile ? artisanProfile.shopName : 'Handloom Artisan';
        productObj.artisanLocation = artisanProfile ? artisanProfile.location : 'India';
        return productObj;
      }
      return typeof p.toObject === 'function' ? p.toObject() : p;
    }));

    res.json({ success: true, count: populatedProducts.length, data: populatedProducts });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ success: false, message: 'Server error listing products.' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('artisan', '_id username');
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const artisanProfile = await ArtisanProfile.findOne({ user: product.artisan._id });
    const productObj = typeof product.toObject === 'function' ? product.toObject() : { ...product };
    productObj.shopName = artisanProfile ? artisanProfile.shopName : 'Handloom Artisan';
    productObj.artisanLocation = artisanProfile ? artisanProfile.location : 'India';
    productObj.artisanBio = artisanProfile ? artisanProfile.bio : '';
    productObj.artisanPhotoUrl = artisanProfile ? artisanProfile.photoUrl : '';

    res.json({ success: true, data: productObj });
  } catch (error) {
    console.error('Fetch product detail error:', error);
    res.status(500).json({ success: false, message: 'Server error loading product details.' });
  }
});

// @route   POST /api/products
// @desc    Create a new product (Artisans only)
router.post('/', protect, restrictTo('artisan'), upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, price, stock } = req.body;

    if (!title || !description || !category || !price || !stock) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a product image.' });
    }

    const product = new Product({
      artisan: req.user._id,
      title,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      imageUrl: `/uploads/${req.file.filename}`
    });

    await product.save();
    res.status(201).json({ success: true, message: 'Product added successfully.', data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error creating product.' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product (Artisan owner only)
router.put('/:id', protect, restrictTo('artisan'), upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, price, stock } = req.body;
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Verify ownership
    if (product.artisan.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this product.' });
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    
    if (req.file) {
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json({ success: true, message: 'Product updated successfully.', data: product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error updating product.' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Artisan owner only)
router.delete('/:id', protect, restrictTo('artisan'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Verify ownership
    if (product.artisan.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product.' });
  }
});

module.exports = router;
