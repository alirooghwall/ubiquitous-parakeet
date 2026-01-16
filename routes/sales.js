const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');

// List sales
router.get('/', ensureAuth, async (req, res) => {
  try {
    let query = {};
    
    // Non-admin users can only see their own sales
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      query.user = req.session.userId;
    }
    
    const sales = await Sale.find(query)
      .populate('user', 'username profile')
      .populate('product')
      .sort({ createdAt: -1 });
    
    res.render('sales/index', {
      title: 'Sales',
      sales
    });
  } catch (error) {
    console.error('Sales list error:', error);
    res.status(500).render('error', { message: 'Error loading sales', error });
  }
});

// Record sale page
router.get('/record', ensureAuth, async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.render('sales/record', { 
      title: 'Record Sale', 
      products,
      error: null 
    });
  } catch (error) {
    console.error('Record sale page error:', error);
    res.status(500).render('error', { message: 'Error loading page', error });
  }
});

// Record sale handler
router.post('/record', ensureAuth, async (req, res) => {
  try {
    const { product: productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    
    const totalAmount = product.price * quantity;
    const pointsEarned = product.points * quantity;
    
    const sale = new Sale({
      user: req.session.userId,
      product: productId,
      quantity,
      totalAmount,
      pointsEarned,
      status: 'completed'
    });
    
    await sale.save();
    
    // Update product stock
    product.stock -= quantity;
    await product.save();
    
    // Update user stats
    const user = await User.findById(req.session.userId);
    user.stats.totalSales += totalAmount;
    user.stats.points += pointsEarned;
    await user.save();
    
    // Notify upline
    if (user.sponsor) {
      await Notification.create({
        user: user.sponsor,
        type: 'sale',
        title: 'New Sale',
        message: `${user.username} made a sale of ${totalAmount}`,
        link: '/sales'
      });
    }
    
    res.json({ success: true, message: 'Sale recorded successfully' });
  } catch (error) {
    console.error('Record sale error:', error);
    res.status(500).json({ success: false, message: 'Error recording sale' });
  }
});

module.exports = router;
