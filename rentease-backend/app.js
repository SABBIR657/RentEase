require('dotenv').config();
// require('express-async-errors');

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');
const notFound     = require('./middleware/notFound');

// Route imports
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const propertyRoutes     = require('./routes/propertyRoutes');
const applicationRoutes  = require('./routes/applicationRoutes');
const bookingRoutes      = require('./routes/bookingRoutes');
const messageRoutes      = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const favouriteRoutes    = require('./routes/favouriteRoutes');
const reportRoutes       = require('./routes/reportRoutes');
const analyticsRoutes    = require('./routes/analyticsRoutes');
const estimatorRoutes    = require('./routes/estimatorRoutes');

const app = express();

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RentEase API is running', version: '1.0.0' });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/users',         userRoutes);
app.use('/api/v1/properties',    propertyRoutes);
app.use('/api/v1/applications',  applicationRoutes);
app.use('/api/v1/bookings',      bookingRoutes);
app.use('/api/v1/messages',      messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reviews',       reviewRoutes);
app.use('/api/v1/favourites',    favouriteRoutes);
app.use('/api/v1/reports',       reportRoutes);
app.use('/api/v1/analytics',     analyticsRoutes);
app.use('/api/v1/estimator',     estimatorRoutes);

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
