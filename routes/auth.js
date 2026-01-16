const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureGuest } = require('../middleware/auth');

// Login page
router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', { title: 'Login', error: null });
});

// Login handler
router.post('/login', ensureGuest, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { 
        title: 'Login', 
        error: 'Invalid email or password' 
      });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', { 
        title: 'Login', 
        error: 'Invalid email or password' 
      });
    }
    
    if (user.status === 'pending') {
      return res.render('auth/login', { 
        title: 'Login', 
        error: 'Your account is pending approval' 
      });
    }
    
    if (user.status === 'rejected' || user.status === 'suspended') {
      return res.render('auth/login', { 
        title: 'Login', 
        error: 'Your account has been ' + user.status 
      });
    }
    
    req.session.userId = user._id;
    user.lastLogin = new Date();
    await user.save();
    
    const returnTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { 
      title: 'Login', 
      error: 'An error occurred. Please try again.' 
    });
  }
});

// Register page
router.get('/register', ensureGuest, (req, res) => {
  res.render('auth/register', { title: 'Register', error: null });
});

// Register handler
router.post('/register', ensureGuest, async (req, res) => {
  try {
    const { username, email, password, confirmPassword, firstName, lastName, phone } = req.body;
    
    if (password !== confirmPassword) {
      return res.render('auth/register', { 
        title: 'Register', 
        error: 'Passwords do not match' 
      });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('auth/register', { 
        title: 'Register', 
        error: 'Email or username already exists' 
      });
    }
    
    const user = new User({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName,
        phone
      }
    });
    
    await user.save();
    
    res.render('auth/login', { 
      title: 'Login', 
      error: null,
      success: 'Registration successful! Please wait for approval before logging in.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', { 
      title: 'Register', 
      error: 'An error occurred. Please try again.' 
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;
