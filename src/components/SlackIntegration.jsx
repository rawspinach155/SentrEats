import React, { useState, useEffect } from 'react'
import { Slack, Link, Unlink, User, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'
import slackService from '../services/slackService'

const SlackIntegration = ({ profileData, onSlackConnect, onSlackDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [slackProfile, setSlackProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if user is connected to Slack on component mount
  useEffect(() => {
    checkSlackConnection()
  }, [])

  const checkSlackConnection = async () => {
    try {
      // In a real app, this would check your backend for stored Slack connection
      const storedConnection = localStorage.getItem('slackConnection')
      if (storedConnection) {
        const connection = JSON.parse(storedConnection)
        setIsConnected(true)
        setSlackProfile(connection.profile)
      }
    } catch (err) {
      console.error('Error checking Slack connection:', err)
    }
  }

  const handleSlackConnect = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Redirect to Slack OAuth
      const authUrl = slackService.getAuthUrl()
      window.location.href = authUrl
    } catch (err) {
      setError('Failed to initiate Slack connection. Please try again.')
      console.error('Slack connection error:', err)
      setIsLoading(false)
    }
  }

  const handleSlackDisconnect = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      localStorage.removeItem('slackConnection')
      setIsConnected(false)
      setSlackProfile(null)
      
      if (onSlackDisconnect) {
        onSlackDisconnect()
      }
    } catch (err) {
      setError('Failed to disconnect from Slack. Please try again.')
      console.error('Slack disconnection error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const openSlackProfile = () => {
    if (slackProfile) {
      window.open(`https://slack.com/app_redirect?channel=@${slackProfile.name}`, '_blank')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-[#4A154B] p-2 rounded-lg">
            <Slack className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#181225]">Slack Integration</h3>
            <p className="text-sm text-gray-600">Connect your profile with Slack</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {isConnected && slackProfile ? (
        <div className="space-y-4">
          {/* Connected Slack Profile */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={slackProfile.image_192}
                alt="Slack Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-[#181225]">{slackProfile.real_name}</h4>
                <p className="text-sm text-gray-600">@{slackProfile.display_name}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Slack ID: {slackProfile.id}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>
                  Status: {slackProfile.status_emoji} {slackProfile.status_text}
                </span>
              </div>
            </div>
          </div>

          {/* Slack Actions */}
          <div className="flex space-x-2">
            <button
              onClick={openSlackProfile}
              className="flex-1 bg-[#4A154B] text-white py-2 px-4 rounded-lg hover:bg-[#3a0f3a] transition-colors flex items-center justify-center space-x-2"
            >
              <Slack className="w-4 h-4" />
              <span>Open in Slack</span>
            </button>
            <button
              onClick={handleSlackDisconnect}
              disabled={isLoading}
              className="flex-1 bg-red-100 text-red-600 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Unlink className="w-4 h-4" />
              <span>{isLoading ? 'Disconnecting...' : 'Disconnect'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connection Benefits */}
          <div className="bg-[#f6f6f8] rounded-lg p-4">
            <h4 className="font-semibold text-[#181225] mb-2">Connect with Slack to:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Share your favorite eateries with teammates</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Get notified about new restaurant reviews</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Sync your profile picture and status</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Join food-related Slack channels automatically</span>
              </li>
            </ul>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleSlackConnect}
            disabled={isLoading}
            className="w-full bg-[#4A154B] text-white py-3 px-4 rounded-lg hover:bg-[#3a0f3a] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Link className="w-4 h-4" />
            <span>{isLoading ? 'Connecting...' : 'Connect with Slack'}</span>
          </button>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Privacy:</strong> We only access your basic profile information and status. 
          We don't read your messages or access private channels.
        </p>
      </div>
    </div>
  )
}

export default SlackIntegration
