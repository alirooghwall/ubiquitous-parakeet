const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Announcement = require('../models/Announcement');
const FeedPost = require('../models/FeedPost');

// Search
router.get('/', ensureAuth, async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q) {
      return res.render('search/index', {
        title: 'Search',
        results: null,
        query: '',
        type: type || 'all'
      });
    }
    
    const searchRegex = new RegExp(q, 'i');
    const results = {
      users: [],
      products: [],
      announcements: [],
      posts: []
    };
    
    if (!type || type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [
          { username: searchRegex },
          { email: searchRegex },
          { 'profile.firstName': searchRegex },
          { 'profile.lastName': searchRegex }
        ]
      }).select('username email profile').limit(10);
    }
    
    if (!type || type === 'all' || type === 'products') {
      results.products = await Product.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ],
        isActive: true
      }).limit(10);
    }
    
    if (!type || type === 'all' || type === 'announcements') {
      results.announcements = await Announcement.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      }).populate('author', 'username profile').limit(10);
    }
    
    if (!type || type === 'all' || type === 'posts') {
      results.posts = await FeedPost.find({
        content: searchRegex
      }).populate('author', 'username profile').limit(10);
    }
    
    res.render('search/index', {
      title: 'Search Results',
      results,
      query: q,
      type: type || 'all'
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).render('error', { message: 'Error performing search', error });
  }
});

module.exports = router;
