const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Slack OAuth configuration
const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '9369401902229.9386685018882';
// TODO: Replace with your actual Slack client secret from https://api.slack.com/apps
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || 'your_slack_client_secret_here';
const SLACK_REDIRECT_URI = process.env.SLACK_REDIRECT_URI || 'https://3d0b9d215ce7.ngrok-free.app/api/auth/slack/callback';

// Debug environment variables
console.log('Slack OAuth Config:', {
  clientId: SLACK_CLIENT_ID,
  clientSecret: SLACK_CLIENT_SECRET ? '***SET***' : '***MISSING***',
  redirectUri: SLACK_REDIRECT_URI
});

// Generate avatar color based on name
const generateAvatarColor = (name) => {
  const brandColors = [
    '#7553ff', '#ff45a8', '#ee8019', '#fdb81b', '#92dd00', '#226dfc'
  ];
  if (!name) return brandColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return brandColors[Math.abs(hash) % brandColors.length];
};

// Create or update user in users.json
const createOrUpdateUser = (userData) => {
  const usersPath = path.join(__dirname, '../../data/users.json');
  
  // Read existing users
  let users = [];
  if (fs.existsSync(usersPath)) {
    const usersData = fs.readFileSync(usersPath, 'utf8');
    users = JSON.parse(usersData);
  }
  
  // Check if user already exists
  let existingUserIndex = users.findIndex(user => user.slackId === userData.slackId);
  
  if (existingUserIndex !== -1) {
    // Update existing user
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Create new user
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
  }
  
  // Write back to file
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  
  return existingUserIndex !== -1 ? users[existingUserIndex] : users[users.length - 1];
};

// Generate JWT token (simple implementation)
const generateJWT = (user) => {
  const payload = {
    userId: user.id,
    slackId: user.slackId,
    name: user.name,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  // Simple base64 encoding for demo (use proper JWT library in production)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Initiate Slack OAuth v2
router.get('/slack', (req, res) => {
  console.log('=== SLACK AUTH DEBUG ===');
  console.log('SLACK_CLIENT_ID:', SLACK_CLIENT_ID);
  console.log('SLACK_CLIENT_SECRET:', SLACK_CLIENT_SECRET);
  console.log('SLACK_REDIRECT_URI:', SLACK_REDIRECT_URI);
  console.log('=======================');
  
  const authUrl = `https://slack.com/openid/connect/authorize?response_type=code&client_id=${SLACK_CLIENT_ID}&scope=openid,profile,email&redirect_uri=${encodeURIComponent(SLACK_REDIRECT_URI)}`;
  res.redirect(authUrl);
});

// Handle Slack OAuth callback
router.get('/slack/callback', async (req, res) => {
  const { code } = req.query;
  
  console.log('Slack OAuth callback received:', { code: code ? 'present' : 'missing' });
  
  if (!code) {
    console.log('No authorization code received');
    return res.redirect('http://localhost:3000/auth/error?message=No authorization code received');
  }
  
  try {
    console.log('=== TOKEN EXCHANGE DEBUG ===');
    console.log('Sending to Slack:');
    console.log('- client_id:', SLACK_CLIENT_ID);
    console.log('- client_secret:', SLACK_CLIENT_SECRET);
    console.log('- code:', code);
    console.log('- redirect_uri:', SLACK_REDIRECT_URI);
    console.log('===========================');
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://slack.com/api/oauth.v2.access', {
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code,
      redirect_uri: SLACK_REDIRECT_URI
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Token response:', tokenResponse.data);
    
    if (!tokenResponse.data.ok) {
      console.error('Slack token error:', tokenResponse.data);
      return res.redirect('http://localhost:3000/auth/error?message=Failed to get access token');
    }

    // Check if we have user data in the response
    if (!tokenResponse.data.authed_user) {
      console.error('No user data in Slack response:', tokenResponse.data);
      return res.redirect('http://localhost:3000/auth/error?message=No user data received from Slack');
    }

    const slackUser = tokenResponse.data.authed_user;
    
    // Get additional user info using the access token
    let userInfo = { id: slackUser.id };
    
    if (slackUser.access_token) {
      try {
        const userInfoResponse = await axios.get('https://slack.com/api/openid.connect.userInfo', {
          headers: {
            'Authorization': `Bearer ${slackUser.access_token}`
          }
        });
        
        if (userInfoResponse.data) {
          userInfo = userInfoResponse.data;
          console.log('OpenID Connect user info:', userInfo);
        }
      } catch (error) {
        console.log('Could not fetch OpenID Connect user info:', error.message);
        console.log('Error details:', error.response?.data);
      }
    }
    
    // Create or update user in our system
    const userData = {
      slackId: slackUser.id,
      name: userInfo.name || userInfo.real_name || 'Unknown User',
      email: userInfo.email || '',
      avatar: userInfo.picture || userInfo.image_192 || '',
      avatarColor: generateAvatarColor(userInfo.name || userInfo.real_name || 'User')
    };

    const user = createOrUpdateUser(userData);
    console.log('=== USER CREATION DEBUG ===');
    console.log('Input userData:', userData);
    console.log('Created/updated user:', user);
    console.log('==========================');
    
    // Generate JWT token
    const token = generateJWT(user);
    console.log('Generated token for user ID:', user.id);
    
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    
  } catch (error) {
    console.error('Slack OAuth error:', error);
    res.redirect('http://localhost:3000/auth/error?message=Authentication failed');
  }
});

// Get current user info
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Decode JWT token (simple base64 decode for demo)
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // Get user from database
    const usersPath = path.join(__dirname, '../../data/users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);
    
    const user = users.find(u => u.id === payload.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
    
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
