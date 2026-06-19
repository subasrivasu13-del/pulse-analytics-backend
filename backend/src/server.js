const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const trackActivity = require('./middlewares/trackActivity');

// Connect to Database
connectDB();

const app = express();

// Enable CORS with credentials support
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport.js
app.use(passport.initialize());

// Global Activity Tracking Middleware
app.use(trackActivity);

// Mount API Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/analytics', require('./routes/analyticsRoutes'));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// SPA catch-all: serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Port configuration
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling for server startup
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use. Please terminate the process using it or choose a different port.`);
  } else {
    console.error('Server error:', err);
  }
});
