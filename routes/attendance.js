const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Attendance = require('../models/Attendance');

// Attendance list
router.get('/', ensureAuth, async (req, res) => {
  try {
    const attendances = await Attendance.find({ user: req.session.userId })
      .sort({ date: -1 })
      .limit(30);
    
    res.render('dashboard/attendance', {
      title: 'Attendance',
      attendances
    });
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).render('error', { message: 'Error loading attendance', error });
  }
});

// Check in
router.post('/checkin', ensureAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      user: req.session.userId,
      date: { $gte: today }
    });
    
    if (existingAttendance) {
      return res.json({ success: false, message: 'Already checked in today' });
    }
    
    const attendance = new Attendance({
      user: req.session.userId,
      checkInTime: new Date()
    });
    
    await attendance.save();
    res.json({ success: true, message: 'Checked in successfully' });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ success: false, message: 'Error checking in' });
  }
});

// Self check
router.post('/selfcheck', ensureAuth, async (req, res) => {
  try {
    const { mood, notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      user: req.session.userId,
      date: { $gte: today }
    });
    
    if (!attendance) {
      return res.json({ success: false, message: 'Please check in first' });
    }
    
    attendance.selfCheck = { mood, notes };
    await attendance.save();
    
    res.json({ success: true, message: 'Self check completed' });
  } catch (error) {
    console.error('Self check error:', error);
    res.status(500).json({ success: false, message: 'Error saving self check' });
  }
});

module.exports = router;
