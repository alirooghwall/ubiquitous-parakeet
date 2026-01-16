const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// Messenger home
router.get('/', ensureAuth, async (req, res) => {
  try {
    // Get conversations (unique users)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);
    
    const userIds = conversations.map(c => c._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username profile');
    
    res.render('messenger/index', {
      title: 'Messenger',
      conversations: users.map(user => {
        const conv = conversations.find(c => c._id.equals(user._id));
        return {
          user,
          lastMessage: conv.lastMessage
        };
      })
    });
  } catch (error) {
    console.error('Messenger error:', error);
    res.status(500).render('error', { message: 'Error loading messenger', error });
  }
});

// Conversation with user
router.get('/:userId', ensureAuth, async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.userId)
      .select('username profile');
    
    if (!otherUser) {
      return res.status(404).render('error', { message: 'User not found' });
    }
    
    const messages = await Message.find({
      $or: [
        { sender: req.session.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.session.userId }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.session.userId, isRead: false },
      { isRead: true }
    );
    
    res.render('messenger/conversation', {
      title: `Chat with ${otherUser.username}`,
      otherUser,
      messages
    });
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).render('error', { message: 'Error loading conversation', error });
  }
});

// Send message
router.post('/send', ensureAuth, async (req, res) => {
  try {
    const { receiver, content } = req.body;
    
    const message = new Message({
      sender: req.session.userId,
      receiver,
      content
    });
    
    await message.save();
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

module.exports = router;
