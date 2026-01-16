require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const { attachUser } = require('./middleware/auth');

const app = express();

// Connect to database
connectDB();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/mlmver2'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// Attach user to all requests
app.use(attachUser);

// Make moment available in views
app.locals.moment = require('moment');

// Routes
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.redirect('/auth/login');
});

app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/participants', require('./routes/participants'));
app.use('/attendance', require('./routes/attendance'));
app.use('/products', require('./routes/products'));
app.use('/sales', require('./routes/sales'));
app.use('/genealogy', require('./routes/genealogy'));
app.use('/analytics', require('./routes/analytics'));
app.use('/announcements', require('./routes/announcements'));
app.use('/feed', require('./routes/feed'));
app.use('/messenger', require('./routes/messenger'));
app.use('/notifications', require('./routes/notifications'));
app.use('/search', require('./routes/search'));

// Error handling
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found',
    error: { status: 404 }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err : { status: err.status }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
