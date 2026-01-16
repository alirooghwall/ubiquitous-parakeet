const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole } = require('../middleware/auth');
const Announcement = require('../models/Announcement');

// List announcements
router.get('/', ensureAuth, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('author', 'username profile')
      .sort({ isPinned: -1, createdAt: -1 });
    
    res.render('announcements/index', {
      title: 'Announcements',
      announcements
    });
  } catch (error) {
    console.error('Announcements error:', error);
    res.status(500).render('error', { message: 'Error loading announcements', error });
  }
});

// Create announcement page
router.get('/create', ensureAuth, ensureRole('admin', 'manager'), (req, res) => {
  res.render('announcements/create', { title: 'Create Announcement', error: null });
});

// Create announcement handler
router.post('/create', ensureAuth, ensureRole('admin', 'manager'), async (req, res) => {
  try {
    const { title, content, category, isPinned } = req.body;
    
    const announcement = new Announcement({
      title,
      content,
      category,
      isPinned: isPinned === 'on',
      author: req.session.userId
    });
    
    await announcement.save();
    res.redirect('/announcements');
  } catch (error) {
    console.error('Create announcement error:', error);
    res.render('announcements/create', { 
      title: 'Create Announcement', 
      error: 'Error creating announcement' 
    });
  }
});

// View announcement
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'username profile');
    
    if (!announcement) {
      return res.status(404).render('error', { message: 'Announcement not found' });
    }
    
    res.render('announcements/view', {
      title: announcement.title,
      announcement
    });
  } catch (error) {
    console.error('View announcement error:', error);
    res.status(500).render('error', { message: 'Error loading announcement', error });
  }
});

module.exports = router;
