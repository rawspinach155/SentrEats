// Slack Service for handling Slack API interactions
// In a real application, you would need to set up Slack OAuth and use proper API keys

class SlackService {
  constructor() {
    // In a real app, these would come from environment variables
    this.clientId = process.env.REACT_APP_SLACK_CLIENT_ID || 'your-slack-client-id'
    this.clientSecret = process.env.REACT_APP_SLACK_CLIENT_SECRET || 'your-slack-client-secret'
    this.redirectUri = process.env.REACT_APP_SLACK_REDIRECT_URI || 'http://localhost:5173/slack/callback'
  }

  // Get Slack OAuth URL for user authorization
  getAuthUrl() {
    const scopes = [
      'users:read',
      'users:read.email',
      'users.profile:read',
      'users.profile:write',
      'chat:write',
      'channels:read'
    ].join(',')

    return `https://slack.com/oauth/v2/authorize?client_id=${this.clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(this.redirectUri)}`
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      const response = await fetch('https://slack.com/api/oauth.v2.access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          redirect_uri: this.redirectUri
        })
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to exchange code for token')
      }

      return data
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      throw error
    }
  }

  // Get user profile information
  async getUserProfile(accessToken, userId) {
    try {
      const response = await fetch(`https://slack.com/api/users.profile.get?user=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to get user profile')
      }

      return data.profile
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  // Get user information
  async getUserInfo(accessToken, userId) {
    try {
      const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to get user info')
      }

      return data.user
    } catch (error) {
      console.error('Error getting user info:', error)
      throw error
    }
  }

  // Update user status
  async updateUserStatus(accessToken, emoji, text) {
    try {
      const response = await fetch('https://slack.com/api/users.profile.set', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: {
            status_emoji: emoji,
            status_text: text
          }
        })
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to update user status')
      }

      return data
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }

  // Send message to a channel
  async sendMessage(accessToken, channel, text) {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: channel,
          text: text
        })
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Get list of channels
  async getChannels(accessToken) {
    try {
      const response = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to get channels')
      }

      return data.channels
    } catch (error) {
      console.error('Error getting channels:', error)
      throw error
    }
  }

  // Join a channel
  async joinChannel(accessToken, channelId) {
    try {
      const response = await fetch('https://slack.com/api/conversations.join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: channelId
        })
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to join channel')
      }

      return data
    } catch (error) {
      console.error('Error joining channel:', error)
      throw error
    }
  }

  // Validate access token
  async validateToken(accessToken) {
    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return data.ok
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }
}

export default new SlackService()
