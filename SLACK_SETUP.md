# Slack Integration Setup Guide

This guide will help you set up the Slack integration for your SentrEats application.

## Prerequisites

1. A Slack workspace where you have admin permissions
2. Node.js and npm installed on your machine

## Step 1: Create a Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Enter your app name (e.g., "SentrEats Integration")
5. Select your workspace

## Step 2: Configure OAuth & Permissions

1. In your Slack app dashboard, go to "OAuth & Permissions" in the sidebar
2. Under "Redirect URLs", add: `http://localhost:5173/slack/callback`
3. Under "Scopes", add the following Bot Token Scopes:
   - `users:read`
   - `users:read.email`
   - `users.profile:read`
   - `users.profile:write`
   - `chat:write`
   - `channels:read`

## Step 3: Get Your App Credentials

1. In your Slack app dashboard, go to "Basic Information"
2. Copy your "Client ID" and "Client Secret"
3. Go to "OAuth & Permissions" and copy your "Bot User OAuth Token" (starts with `xoxb-`)

## Step 4: Set Up Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Slack App Credentials
REACT_APP_SLACK_CLIENT_ID=your-client-id-here
REACT_APP_SLACK_CLIENT_SECRET=your-client-secret-here
REACT_APP_SLACK_REDIRECT_URI=http://localhost:5173/slack/callback
REACT_APP_SLACK_BOT_TOKEN=xoxb-your-bot-token-here
```

## Step 5: Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

## Step 6: Start the Development Server

```bash
npm run dev
```

## Step 7: Test the Integration

1. Navigate to your app and go to the Profile section
2. Click "Connect with Slack"
3. You should be redirected to Slack for authorization
4. After authorizing, you'll be redirected back to your app
5. Your Slack profile should now be connected!

## Features

Once connected, users can:

- **View their Slack profile** in the SentrEats app
- **Sync their profile picture** and status
- **Share restaurant recommendations** with teammates
- **Get notifications** about new reviews
- **Join food-related channels** automatically

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in your Slack app settings matches exactly: `http://localhost:5173/slack/callback`

2. **"Insufficient scopes" error**
   - Ensure all required scopes are added to your Slack app

3. **"Client ID not found" error**
   - Verify your environment variables are set correctly
   - Restart your development server after changing environment variables

4. **CORS errors**
   - Make sure you're running the app on `http://localhost:5173`
   - Check that your Slack app redirect URI is configured correctly

### Security Notes

- Never commit your `.env` file to version control
- Keep your Slack app credentials secure
- The integration only accesses basic profile information and status
- No private messages or channels are accessed

## Production Deployment

For production deployment:

1. Update the redirect URI in your Slack app to your production domain
2. Set up proper environment variables on your hosting platform
3. Ensure HTTPS is enabled (required for Slack OAuth)
4. Update the `REACT_APP_SLACK_REDIRECT_URI` to your production URL

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Slack app configuration
3. Ensure all environment variables are set correctly
4. Check that your Slack workspace allows the required permissions
