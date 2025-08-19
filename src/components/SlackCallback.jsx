import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import slackService from '../services/slackService'

const SlackCallback = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('Connecting to Slack...')

  useEffect(() => {
    handleSlackCallback()
  }, [])

  const handleSlackCallback = async () => {
    try {
      // Get the authorization code from URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        throw new Error(error)
      }

      if (!code) {
        throw new Error('No authorization code received')
      }

      setMessage('Exchanging authorization code for access token...')

      // Exchange the authorization code for an access token
      const tokenResponse = await slackService.exchangeCodeForToken(code)
      
      setMessage('Getting user profile information...')

      // Get user information
      const userInfo = await slackService.getUserInfo(tokenResponse.access_token, tokenResponse.authed_user.id)
      
      setMessage('Getting user profile...')

      // Get user profile
      const userProfile = await slackService.getUserProfile(tokenResponse.access_token, tokenResponse.authed_user.id)

      // Combine user info and profile
      const slackProfile = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.profile.email,
        real_name: userInfo.real_name,
        display_name: userInfo.profile.display_name || userInfo.name,
        image_192: userInfo.profile.image_192,
        status_emoji: userProfile.status_emoji || '',
        status_text: userProfile.status_text || '',
        team_id: tokenResponse.team.id,
        team_name: tokenResponse.team.name
      }

      // Store the connection data
      const connection = {
        profile: slackProfile,
        accessToken: tokenResponse.access_token,
        teamId: tokenResponse.team.id,
        connectedAt: new Date().toISOString()
      }

      localStorage.setItem('slackConnection', JSON.stringify(connection))

      setStatus('success')
      setMessage('Successfully connected to Slack!')

      // Call success callback
      if (onSuccess) {
        onSuccess(connection)
      }

      // Redirect back to profile page after a short delay
      setTimeout(() => {
        window.location.href = '/#profile'
      }, 2000)

    } catch (error) {
      console.error('Slack callback error:', error)
      setStatus('error')
      setMessage(error.message || 'Failed to connect to Slack')
      
      if (onError) {
        onError(error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <div className="mb-4">
              <Loader className="w-12 h-12 text-[#4A154B] animate-spin mx-auto" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="mb-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-[#181225] mb-2">
            {status === 'loading' && 'Connecting to Slack...'}
            {status === 'success' && 'Connection Successful!'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          
          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'error' && (
            <button
              onClick={() => window.location.href = '/#profile'}
              className="bg-[#4A154B] text-white py-2 px-4 rounded-lg hover:bg-[#3a0f3a] transition-colors"
            >
              Back to Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SlackCallback
