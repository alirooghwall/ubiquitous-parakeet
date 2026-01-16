const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole } = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

// List participants
router.get('/', ensureAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { 'profile.firstName': new RegExp(search, 'i') },
        { 'profile.lastName': new RegExp(search, 'i') }
      ];
    }
    
    const participants = await User.find(query)
      .populate('sponsor', 'username profile')
      .sort({ createdAt: -1 });
    
    res.render('participants/index', {
      title: 'Participants',
      participants,
      filter: { status, search }
    });
  } catch (error) {
    console.error('Participants list error:', error);
    res.status(500).render('error', { message: 'Error loading participants', error });
  }
});

// Approve participant
router.post('/:id/approve', ensureAuth, ensureRole('admin', 'manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.status = 'active';
    await user.save();
    
    // Create notification
    await Notification.create({
      user: user._id,
      type: 'approval',
      title: 'Account Approved',
      message: 'Your account has been approved. You can now log in.',
      link: '/auth/login'
    });
    
    res.json({ success: true, message: 'Participant approved' });
  } catch (error) {
    console.error('Approve participant error:', error);
    res.status(500).json({ success: false, message: 'Error approving participant' });
  }
});

// Reject participant
router.post('/:id/reject', ensureAuth, ensureRole('admin', 'manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.status = 'rejected';
    await user.save();
    
    // Create notification
    await Notification.create({
      user: user._id,
      type: 'approval',
      title: 'Account Rejected',
      message: 'Your account application has been rejected.',
      link: '/auth/register'
    });
    
    res.json({ success: true, message: 'Participant rejected' });
  } catch (error) {
    console.error('Reject participant error:', error);
    res.status(500).json({ success: false, message: 'Error rejecting participant' });
  }
});

// View participant profile
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const participant = await User.findById(req.params.id)
      .populate('sponsor', 'username profile')
      .populate('genealogy.upline', 'username profile');
    
    if (!participant) {
      return res.status(404).render('error', { message: 'Participant not found' });
    }
    
    const recruits = await User.find({ sponsor: participant._id });
    const sales = await Sale.find({ user: participant._id })
      .populate('product')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.render('participants/view', {
      title: 'Participant Profile',
      participant,
      recruits,
      sales
    });
  } catch (error) {
    console.error('View participant error:', error);
    res.status(500).render('error', { message: 'Error loading participant', error });
  }
});

module.exports = router;
