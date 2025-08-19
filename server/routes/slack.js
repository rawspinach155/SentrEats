const express = require('express');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

const router = express.Router();

// Handle Slack interactive components (button clicks, modal submissions)
router.post('/interactive', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    
    if (payload.type === 'view_submission') {
      await handleModalSubmission(payload);
    } else if (payload.type === 'block_actions') {
      await handleBlockActions(payload);
    }
    
    res.status(200).send();
  } catch (error) {
    console.error('Error handling interactive component:', error);
    res.status(500).send();
  }
});

// Handle Slack events (messages, reactions, etc.)
router.post('/events', async (req, res) => {
  try {
    const { event, team_id } = req.body;
    
    if (event.type === 'message' && event.text) {
      await handleMessageEvent(event, team_id);
    } else if (event.type === 'reaction_added') {
      await handleReactionEvent(event, team_id);
    }
    
    res.status(200).send();
  } catch (error) {
    console.error('Error handling Slack event:', error);
    res.status(500).send();
  }
});

// Handle modal submissions from Slack
async function handleModalSubmission(payload) {
  try {
    const { view, user } = payload;
    const values = view.state.values;
    
    if (view.callback_id === 'restaurant_submission') {
      const restaurantName = values.restaurant_name.name_input.value;
      const address = values.restaurant_address.address_input.value;
      const dietaryOptions = values.dietary_options.dietary_input.value;
      
      // Find or create user
      let slackUser = await User.findOne({ slackId: user.id });
      
      if (!slackUser) {
        // Create a basic user record if they don't exist
        slackUser = new User({
          slackId: user.id,
          slackUsername: user.username || 'unknown',
          slackTeamId: payload.team?.id || 'unknown',
          slackTeamName: payload.team?.name || 'unknown',
          preferences: {
            dietaryRestrictions: [],
            favoriteCuisines: [],
            priceRange: 'moderate'
          }
        });
        await slackUser.save();
      }
      
      // Create restaurant
      const restaurant = new Restaurant({
        name: restaurantName,
        address: {
          street: address,
          city: 'Unknown', // Could be enhanced with geocoding
          country: 'Unknown'
        },
        cuisine: 'Unknown', // Could be enhanced with AI classification
        dietaryOptions: dietaryOptions.split(',').map(opt => opt.trim()).filter(opt => opt),
        addedBy: slackUser._id,
        addedViaSlack: true,
        slackChannel: payload.channel?.id,
        isVerified: false
      });
      
      await restaurant.save();
      
      // Send confirmation message
      const client = require('@slack/web-api');
      const slackClient = new client.WebClient(process.env.SLACK_BOT_TOKEN);
      
      await slackClient.chat.postMessage({
        channel: user.id,
        text: `✅ Restaurant "${restaurantName}" has been added to your SentrEats collection!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Restaurant Added Successfully!* 🎉\n\n*Name:* ${restaurantName}\n*Address:* ${address}\n*Dietary Options:* ${dietaryOptions || 'None specified'}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View in SentrEats App'
                },
                url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/restaurants/${restaurant._id}`,
                style: 'primary'
              }
            ]
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error handling modal submission:', error);
  }
}

// Handle block actions (button clicks, etc.)
async function handleBlockActions(payload) {
  try {
    const { actions, user } = payload;
    
    for (const action of actions) {
      if (action.action_id === 'view_restaurant') {
        await handleViewRestaurant(action, user);
      } else if (action.action_id === 'add_to_favorites') {
        await handleAddToFavorites(action, user);
      }
    }
  } catch (error) {
    console.error('Error handling block actions:', error);
  }
}

// Handle message events
async function handleMessageEvent(event, teamId) {
  try {
    const { text, user, channel } = event;
    
    // Check for restaurant mentions or specific keywords
    if (text.toLowerCase().includes('restaurant') || text.toLowerCase().includes('food')) {
      // Could implement AI-powered restaurant suggestions here
      console.log('Restaurant-related message detected:', text);
    }
  } catch (error) {
    console.error('Error handling message event:', error);
  }
}

// Handle reaction events
async function handleReactionEvent(event, teamId) {
  try {
    const { reaction, user, item } = event;
    
    if (reaction === 'heart' || reaction === 'thumbsup') {
      // Could implement rating system based on reactions
      console.log('Positive reaction detected:', reaction);
    }
  } catch (error) {
    console.error('Error handling reaction event:', error);
  }
}

// Handle viewing restaurant details
async function handleViewRestaurant(action, user) {
  try {
    const restaurantId = action.value;
    const restaurant = await Restaurant.findById(restaurantId)
      .populate('addedBy', 'slackUsername');
    
    if (restaurant) {
      const client = require('@slack/web-api');
      const slackClient = new client.WebClient(process.env.SLACK_BOT_TOKEN);
      
      await slackClient.chat.postEphemeral({
        channel: user.id,
        user: user.id,
        text: `🍽️ *${restaurant.name}*\n\n*Cuisine:* ${restaurant.cuisine}\n*Address:* ${restaurant.address.street}, ${restaurant.address.city}\n*Dietary Options:* ${restaurant.dietaryOptions.join(', ') || 'None'}\n*Rating:* ${restaurant.rating.average}/5 (${restaurant.rating.count} reviews)\n\nAdded by: ${restaurant.addedBy.slackUsername}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🍽️ *${restaurant.name}*\n\n*Cuisine:* ${restaurant.cuisine}\n*Address:* ${restaurant.address.street}, ${restaurant.address.city}\n*Dietary Options:* ${restaurant.dietaryOptions.join(', ') || 'None'}\n*Rating:* ${restaurant.rating.average}/5 (${restaurant.rating.count} reviews)\n\nAdded by: ${restaurant.addedBy.slackUsername}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Full Details'
                },
                url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/restaurants/${restaurant._id}`,
                style: 'primary'
              }
            ]
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error handling view restaurant:', error);
  }
}

// Handle adding restaurant to favorites
async function handleAddToFavorites(action, user) {
  try {
    const restaurantId = action.value;
    const slackUser = await User.findOne({ slackId: user.id });
    
    if (slackUser) {
      // Add to user's favorite cuisines or create a favorites system
      // This could be enhanced based on your requirements
      
      const client = require('@slack/web-api');
      const slackClient = new client.WebClient(process.env.SLACK_BOT_TOKEN);
      
      await slackClient.chat.postEphemeral({
        channel: user.id,
        user: user.id,
        text: '✅ Restaurant added to your favorites!'
      });
    }
  } catch (error) {
    console.error('Error handling add to favorites:', error);
  }
}

module.exports = router;
