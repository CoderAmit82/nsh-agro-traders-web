const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// Multer Config for local image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Images only (jpeg, jpg, png, webp) supported!'));
  }
});

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, rating, inStock } = req.query;
    let query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search query
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.ratings = { $gte: Number(rating) };
    }

    // Stock availability filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 5), async (req, res, next) => {
  try {
    const { name, category, price, discount, description, usageDetails, stock, manufacturer, expiryDate, batchNumber } = req.body;

    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      discount: Number(discount || 0),
      description,
      usageDetails,
      stock: Number(stock),
      images: imagePaths,
      manufacturingDetails: {
        manufacturer,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        batchNumber
      }
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, category, price, discount, description, usageDetails, stock, manufacturer, expiryDate, batchNumber } = req.body;

    // Handle new image files if uploaded
    let imagePaths = product.images;
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price !== undefined ? Number(price) : product.price;
    product.discount = discount !== undefined ? Number(discount) : product.discount;
    product.description = description || product.description;
    product.usageDetails = usageDetails || product.usageDetails;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.images = imagePaths;
    product.manufacturingDetails = {
      manufacturer: manufacturer !== undefined ? manufacturer : product.manufacturingDetails.manufacturer,
      expiryDate: expiryDate ? new Date(expiryDate) : product.manufacturingDetails.expiryDate,
      batchNumber: batchNumber !== undefined ? batchNumber : product.manufacturingDetails.batchNumber
    };

    const updatedProduct = await product.save();
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
});

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed the product
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed' });
    }

    const review = {
      userId: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.calculateAverageRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle item in wishlist
// @route   POST /api/products/wishlist/:id
// @access  Private
router.post('/wishlist/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      await user.save();
      res.json({ success: true, isWishlisted: false, message: 'Product removed from wishlist' });
    } else {
      user.wishlist.push(productId);
      await user.save();
      res.json({ success: true, isWishlisted: true, message: 'Product added to wishlist' });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get logged in user's wishlist
// @route   GET /api/products/wishlist
// @access  Private
router.get('/wishlist/all', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
