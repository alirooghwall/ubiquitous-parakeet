const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');

// Dashboard home
router.get('/', ensureAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).populate('sponsor genealogy.upline');
    
    // Get user stats
    const totalSales = await Sale.countDocuments({ user: userId, status: 'completed' });
    const totalRecruits = await User.countDocuments({ sponsor: userId });
    const pendingApprovals = req.user.role === 'admin' ? 
      await User.countDocuments({ status: 'pending' }) : 0;
    
    // Get recent notifications
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recent announcements
    const announcements = await Announcement.find()
      .populate('author', 'username profile')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5);
    
    res.render('dashboard/index', {
      title: 'Dashboard',
      user,
      stats: {
        totalSales,
        totalRecruits,
        pendingApprovals,
        points: user.stats.points
      },
      notifications,
      announcements
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { message: 'Error loading dashboard', error });
  }
});

module.exports = router;
