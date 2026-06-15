const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Google OAuth callback handler
exports.googleCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
    const token = generateToken(req.user);
    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/login/success?token=${token}`);
  } catch (error) {
    console.error('Google callback controller error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=server_error`);
  }
};

// Developer Sandbox Login (Mock Login fallback)
exports.sandboxLogin = async (req, res) => {
  try {
    const sandboxEmail = 'sandbox@pulseanalytics.dev';
    let user = await User.findOne({ email: sandboxEmail });

    if (user) {
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = await User.create({
        name: 'Developer Sandbox',
        email: sandboxEmail,
        provider: 'mock',
        profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sandbox',
        createdAt: new Date(),
        lastLogin: new Date()
      });
    }

    const token = generateToken(user);
    // Redirect to frontend with token, matching the OAuth flow
    res.redirect(`${FRONTEND_URL}/login/success?token=${token}`);
  } catch (error) {
    console.error('Sandbox login error:', error);
    res.status(500).json({ message: 'Internal server error during mock login' });
  }
};

// Fetch current user details
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving user' });
  }
};

// Logout handler
exports.logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout error' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};
