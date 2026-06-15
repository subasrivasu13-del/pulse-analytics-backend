const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientID && clientSecret && clientID !== 'your_google_client_id_here' && clientSecret !== 'your_google_client_secret_here') {
  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
      let user = await User.findOne({ email });
      
      const profilePic = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
      
      if (user) {
        user.name = profile.displayName;
        user.profilePic = profilePic;
        user.lastLogin = new Date();
        await user.save();
      } else {
        user = await User.create({
          name: profile.displayName,
          email,
          provider: 'google',
          profilePic,
          createdAt: new Date(),
          lastLogin: new Date()
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.warn('WARNING: Passport Google OAuth is not configured with valid credentials. Google Login will fall back to Mock Login.');
}

module.exports = passport;
