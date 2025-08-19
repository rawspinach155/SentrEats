const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { App } = require('@slack/bolt');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const slackRoutes = require('./routes/slack');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Slack app
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: PORT
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET,
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

// Routes
app.use('/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/slack', slackRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SentrEats Slack Backend is running' });
});

// Slack app event handlers
slackApp.command('/add-restaurant', async ({ command, ack, say }) => {
  await ack();
  
  const modal = {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'Add New Restaurant'
    },
    submit: {
      type: 'plain_text',
      text: 'Submit'
    },
    callback_id: 'restaurant_submission',
    blocks: [
      {
        type: 'input',
        block_id: 'restaurant_name',
        label: {
          type: 'plain_text',
          text: 'Restaurant Name'
        },
        element: {
          type: 'plain_text_input',
          action_id: 'name_input'
        }
      },
      {
        type: 'input',
        block_id: 'restaurant_address',
        label: {
          type: 'plain_text',
          text: 'Address'
        },
        element: {
          type: 'plain_text_input',
          action_id: 'address_input'
        }
      },
      {
        type: 'input',
        block_id: 'dietary_options',
        label: {
          type: 'plain_text',
          text: 'Dietary Options (comma-separated)'
        },
        element: {
          type: 'plain_text_input',
          action_id: 'dietary_input',
          placeholder: {
            type: 'plain_text',
            text: 'e.g., vegetarian, vegan, gluten-free'
          }
        }
      }
    ]
  };

  try {
    await slackApp.client.views.open({
      trigger_id: command.trigger_id,
      view: modal
    });
  } catch (error) {
    console.error('Error opening modal:', error);
    await say('Sorry, there was an error opening the form.');
  }
});

slackApp.command('/recommend', async ({ command, ack, say }) => {
  await ack();
  
  // This will be implemented to show restaurant recommendations
  await say('🍽️ Restaurant recommendations coming soon! Use `/add-restaurant` to add your favorite spots first.');
});

// Start the server and Slack app
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    // Start Slack app
    await slackApp.start();
    console.log('⚡ Slack app is running!');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 SentrEats Slack Backend running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await slackApp.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await slackApp.stop();
  process.exit(0);
});
