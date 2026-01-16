const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const FeedPost = require('../models/FeedPost');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, 'feed-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Feed home
router.get('/', ensureAuth, async (req, res) => {
  try {
    const posts = await FeedPost.find()
      .populate('author', 'username profile')
      .populate('comments.user', 'username profile')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.render('feed/index', {
      title: 'Feed',
      posts
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).render('error', { message: 'Error loading feed', error });
  }
});

// Create post
router.post('/create', ensureAuth, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    
    const post = new FeedPost({
      author: req.session.userId,
      content,
      image: req.file ? '/uploads/' + req.file.filename : null
    });
    
    await post.save();
    res.redirect('/feed');
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Error creating post' });
  }
});

// Like post
router.post('/:id/like', ensureAuth, async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const userIndex = post.likes.indexOf(req.session.userId);
    
    if (userIndex > -1) {
      post.likes.splice(userIndex, 1);
    } else {
      post.likes.push(req.session.userId);
    }
    
    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, message: 'Error liking post' });
  }
});

// Comment on post
router.post('/:id/comment', ensureAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await FeedPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    post.comments.push({
      user: req.session.userId,
      text
    });
    
    await post.save();
    res.json({ success: true, message: 'Comment added' });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
});

module.exports = router;
