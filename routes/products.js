const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole } = require('../middleware/auth');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, 'product-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// List products
router.get('/', ensureAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = new RegExp(search, 'i');
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    res.render('products/index', {
      title: 'Products',
      products,
      filter: { category, search }
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).render('error', { message: 'Error loading products', error });
  }
});

// Add product page
router.get('/add', ensureAuth, ensureRole('admin', 'manager'), (req, res) => {
  res.render('products/add', { title: 'Add Product', error: null });
});

// Add product handler
router.post('/add', ensureAuth, ensureRole('admin', 'manager'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, points, category, stock } = req.body;
    
    const product = new Product({
      name,
      description,
      price,
      points: points || 0,
      category,
      stock: stock || 0,
      image: req.file ? '/uploads/' + req.file.filename : null
    });
    
    await product.save();
    res.redirect('/products');
  } catch (error) {
    console.error('Add product error:', error);
    res.render('products/add', { 
      title: 'Add Product', 
      error: 'Error adding product' 
    });
  }
});

// View product
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).render('error', { message: 'Product not found' });
    }
    
    res.render('products/view', {
      title: product.name,
      product
    });
  } catch (error) {
    console.error('View product error:', error);
    res.status(500).render('error', { message: 'Error loading product', error });
  }
});

module.exports = router;
