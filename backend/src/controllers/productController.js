const Product = require('../models/Product');
const ArtisanProfile = require('../models/ArtisanProfile');
const Category = require('../models/Category');

/**
 * Get products with rich search, filters, sorting, and pagination
 * Gracefully handles empty database state
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      craftType,
      craftOrigin,
      minPrice,
      maxPrice,
      inStock,
      featured,
      artisanId,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      isPublished: true,
      isApprovedByAdmin: true,
    };

    // Text search in title, description, or craft origin
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { craftOrigin: { $regex: search.trim(), $options: 'i' } },
        { material: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category) {
      // Find category by slug or id
      const catDoc = await Category.findOne({
        $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { slug: category }],
      });
      if (catDoc) {
        query.category = catDoc._id;
      }
    }

    if (craftOrigin) {
      query.craftOrigin = { $regex: craftOrigin, $options: 'i' };
    }

    if (artisanId) {
      query.artisan = artisanId;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by craftType via ArtisanProfile
    if (craftType) {
      const artisans = await ArtisanProfile.find({
        craftType: { $regex: craftType, $options: 'i' },
      }).select('_id');
      const artisanIds = artisans.map((a) => a._id);
      query.artisan = { $in: artisanIds };
    }

    // Sorting
    let sortObj = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1, numReviews: -1 };
    else if (sort === 'popular') sortObj = { numReviews: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug craftType')
        .populate({
          path: 'artisan',
          select: 'craftType location rating totalReviews profilePhoto craftStory',
          populate: { path: 'user', select: 'name avatar' },
        })
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description craftType')
      .populate({
        path: 'artisan',
        select: 'craftType craftStory location rating totalReviews profilePhoto totalSales',
        populate: { path: 'user', select: 'name email phone avatar' },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Product
 * Permitted for approved artisans only
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      price,
      originalPrice,
      stock,
      material,
      dimensions,
      craftOrigin,
      images,
      tags,
    } = req.body;

    if (!title || !description || !category || !price || !material || !craftOrigin) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, price, material, craftOrigin.',
      });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one product image URL or upload an image.',
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected.',
      });
    }

    const product = await Product.create({
      title,
      description,
      category,
      artisan: req.artisanProfile._id,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.15,
      stock: Number(stock) || 1,
      material,
      dimensions: dimensions || '',
      craftOrigin,
      images,
      tags: tags || [],
      isPublished: true,
      isApprovedByAdmin: true,
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Product
 * Permitted for artisan who owns the product, or admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ownership check: If artisan, must match their profile ID
    if (req.user.role === 'artisan') {
      const profile = await ArtisanProfile.findOne({ user: req.user._id });
      if (!profile || product.artisan.toString() !== profile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only edit your own products.',
        });
      }
    }

    const {
      title,
      description,
      category,
      price,
      originalPrice,
      stock,
      material,
      dimensions,
      craftOrigin,
      images,
      tags,
      isPublished,
      featured,
    } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (material) product.material = material;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (craftOrigin) product.craftOrigin = craftOrigin;
    if (images && Array.isArray(images) && images.length > 0) product.images = images;
    if (tags !== undefined) product.tags = tags;
    if (isPublished !== undefined) product.isPublished = Boolean(isPublished);

    // Only admin can toggle featured
    if (req.user.role === 'admin' && featured !== undefined) {
      product.featured = Boolean(featured);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Product
 * Permitted for artisan owner or admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'artisan') {
      const profile = await ArtisanProfile.findOne({ user: req.user._id });
      if (!profile || product.artisan.toString() !== profile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only delete your own products.',
        });
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products for current artisan (their catalog)
 */
const getMyArtisanProducts = async (req, res, next) => {
  try {
    const profile = await ArtisanProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Artisan profile not found' });
    }

    const products = await Product.find({ artisan: profile._id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyArtisanProducts,
};
