const express = require('express');
const passport = require('passport');
const SlackStrategy = require('@aoberoi/passport-slack').default.Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Configure Slack OAuth strategy
passport.use(new SlackStrategy({
  clientID: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  skipUserProfile: false,
  scope: ['users:read', 'users:read.email', 'chat:write', 'commands']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ slackId: profile.id });
    
    if (user) {
      // Update existing user
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.lastActive = new Date();
      user.slackUsername = profile.displayName;
      user.profile.displayName = profile.displayName;
      user.profile.image = profile._json.image_512;
      
      if (profile._json.team) {
        user.slackTeamId = profile._json.team.id;
        user.slackTeamName = profile._json.team.name;
      }
      
      await user.save();
    } else {
      // Create new user
      user = new User({
        slackId: profile.id,
        slackUsername: profile.displayName || profile.username || 'unknown',
        slackTeamId: profile._json.team?.id || 'unknown',
        slackTeamName: profile._json.team?.name || 'unknown',
        email: profile._json.email || 'unknown@slack.com',
        profile: {
          firstName: profile._json.first_name || profile.displayName?.split(' ')[0] || 'Unknown',
          lastName: profile._json.last_name || profile.displayName?.split(' ').slice(1).join(' ') || 'Unknown',
          displayName: profile.displayName || profile.username || 'Unknown User',
          image: profile._json.image_512 || profile._json.image_192 || '/logo.png'
        },
        accessToken,
        refreshToken,
        preferences: {
          dietaryRestrictions: [],
          favoriteCuisines: [],
          priceRange: 'moderate'
        }
      });
      
      await user.save();
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Slack OAuth routes
router.get('/slack', passport.authenticate('slack'));

router.get('/slack/callback', 
  passport.authenticate('slack', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id, slackId: req.user.slackId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-accessToken -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update preferences
    if (req.body.dietaryRestrictions) {
      user.preferences.dietaryRestrictions = req.body.dietaryRestrictions;
    }
    
    if (req.body.favoriteCuisines) {
      user.preferences.favoriteCuisines = req.body.favoriteCuisines;
    }
    
    if (req.body.priceRange) {
      user.preferences.priceRange = req.body.priceRange;
    }
    
    if (req.body.location) {
      user.preferences.location = req.body.location;
    }
    
    await user.save();
    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
