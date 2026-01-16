const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const User = require('../models/User');

// Genealogy tree view
router.get('/', ensureAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId)
      .populate('genealogy.upline', 'username profile');
    
    // Get downline (direct recruits)
    const downline = await User.find({ 'genealogy.upline': userId })
      .populate('sponsor', 'username profile');
    
    // Get team statistics
    const teamCount = await User.countDocuments({ 'genealogy.upline': userId });
    
    res.render('genealogy/index', {
      title: 'Genealogy Tree',
      user,
      downline,
      teamCount
    });
  } catch (error) {
    console.error('Genealogy error:', error);
    res.status(500).render('error', { message: 'Error loading genealogy', error });
  }
});

// API endpoint for tree data
router.get('/api/tree/:userId?', ensureAuth, async (req, res) => {
  try {
    const userId = req.params.userId || req.session.userId;
    
    const user = await User.findById(userId)
      .select('username profile stats genealogy');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get direct downline
    const children = await User.find({ 'genealogy.upline': userId })
      .select('username profile stats genealogy');
    
    const treeData = {
      id: user._id,
      username: user.username,
      name: `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim(),
      level: user.genealogy.level,
      points: user.stats.points,
      children: children.map(child => ({
        id: child._id,
        username: child.username,
        name: `${child.profile.firstName || ''} ${child.profile.lastName || ''}`.trim(),
        level: child.genealogy.level,
        points: child.stats.points
      }))
    };
    
    res.json(treeData);
  } catch (error) {
    console.error('Tree API error:', error);
    res.status(500).json({ error: 'Error loading tree data' });
  }
});

module.exports = router;
