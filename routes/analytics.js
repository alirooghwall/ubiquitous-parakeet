const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const User = require('../models/User');
const Sale = require('../models/Sale');

// Analytics dashboard
router.get('/', ensureAuth, async (req, res) => {
  try {
    // Top performers by sales
    const topSales = await User.find({ status: 'active' })
      .sort({ 'stats.totalSales': -1 })
      .limit(10)
      .select('username profile stats');
    
    // Top recruiters
    const topRecruiters = await User.find({ status: 'active' })
      .sort({ 'stats.totalRecruits': -1 })
      .limit(10)
      .select('username profile stats');
    
    // Top by points
    const topPoints = await User.find({ status: 'active' })
      .sort({ 'stats.points': -1 })
      .limit(10)
      .select('username profile stats');
    
    // Recent sales summary
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);
    
    res.render('analytics/index', {
      title: 'Analytics & Leaderboards',
      topSales,
      topRecruiters,
      topPoints,
      recentSales: recentSales[0] || { totalSales: 0, totalTransactions: 0 }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).render('error', { message: 'Error loading analytics', error });
  }
});

module.exports = router;
