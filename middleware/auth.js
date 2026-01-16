// Middleware to check if user is authenticated
const ensureAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

// Middleware to check if user is a guest (not authenticated)
const ensureGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

// Middleware to check if user has specific role
const ensureRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).render('error', {
        message: 'Access denied. Insufficient permissions.',
        error: { status: 403 }
      });
    }
    
    next();
  };
};

// Middleware to attach user to request
const attachUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        req.user = user;
        res.locals.user = user;
      } else {
        req.session.destroy();
      }
    } catch (error) {
      console.error('Error attaching user:', error);
    }
  }
  next();
};

module.exports = {
  ensureAuth,
  ensureGuest,
  ensureRole,
  attachUser
};
