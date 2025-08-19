const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SentrEats Simple Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Simple server is working!',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
    }
  });
});

// Mock auth endpoint for testing
app.get('/auth/me', (req, res) => {
  // For testing purposes, return a mock user
  res.json({
    _id: 'mock-user-id',
    slackId: 'mock-slack-id',
    slackUsername: 'TestUser',
    profile: {
      displayName: 'Test User',
      image: '/logo.png'
    },
    preferences: {
      dietaryRestrictions: [],
      favoriteCuisines: [],
      priceRange: 'moderate'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 SentrEats Simple Backend running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`👤 Mock auth: http://localhost:${PORT}/auth/me`);
  console.log('');
  console.log('✅ Server started successfully!');
  console.log('⚠️  Note: This is a simplified server for testing');
  console.log('   Slack integration is disabled');
});
