const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const protect = require('../middlewares/auth');

const router = express.Router();

// GET /auth/google
router.get('/google', (req, res, next) => {
  if (!passport._strategies || !passport._strategies.google) {
    console.log('Google OAuth not configured. Redirecting to Sandbox Mock Login.');
    return res.redirect('/auth/sandbox');
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

// GET /auth/google/callback
router.get('/google/callback', (req, res, next) => {
  if (!passport._strategies || !passport._strategies.google) {
    return res.redirect('/auth/sandbox');
  }
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/login?error=oauth_failed`
  })(req, res, next);
}, authController.googleCallback);

// GET /auth/sandbox - Mock Login Route
router.get('/sandbox', authController.sandboxLogin);

// GET /auth/logout
router.get('/logout', authController.logoutUser);

// GET /auth/user - Fetch profile of logged-in user
router.get('/user', protect, authController.getCurrentUser);

module.exports = router;
