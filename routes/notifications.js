const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get notifications
router.get('/', ensureAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.session.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.render('notifications/index', {
      title: 'Notifications',
      notifications
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).render('error', { message: 'Error loading notifications', error });
  }
});

// Mark notification as read
router.post('/:id/read', ensureAuth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
});

// Mark all as read
router.post('/read-all', ensureAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.session.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
});

// API endpoint for unread count
router.get('/api/unread-count', ensureAuth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.session.userId,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Error getting count' });
  }
});

module.exports = router;
