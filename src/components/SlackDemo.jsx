import React, { useState } from 'react'
import { Slack, MessageCircle, Users, Bell, Share2 } from 'lucide-react'

const SlackDemo = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [demoMessages, setDemoMessages] = useState([])

  const handleDemoConnect = () => {
    setIsConnected(true)
    // Simulate some demo messages
    setDemoMessages([
      {
        id: 1,
        user: 'John Doe',
        message: 'Just discovered an amazing vegan restaurant! 🍃',
        timestamp: new Date().toLocaleTimeString(),
        channel: '#food-recommendations'
      },
      {
        id: 2,
        user: 'Jane Smith',
        message: 'Anyone up for lunch at the new boba place? 🧋',
        timestamp: new Date().toLocaleTimeString(),
        channel: '#team-lunch'
      }
    ])
  }

  const handleDemoDisconnect = () => {
    setIsConnected(false)
    setDemoMessages([])
  }

  const sendDemoMessage = () => {
    const newMessage = {
      id: Date.now(),
      user: 'You',
      message: 'Check out this awesome restaurant I found! 🍕',
      timestamp: new Date().toLocaleTimeString(),
      channel: '#food-recommendations'
    }
    setDemoMessages([...demoMessages, newMessage])
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-[#4A154B] p-2 rounded-lg">
            <Slack className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#181225]">Slack Integration Demo</h3>
            <p className="text-sm text-gray-600">See how the integration works</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isConnected ? 'Demo Connected' : 'Demo Mode'}
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <div className="bg-[#f6f6f8] rounded-lg p-4">
            <h4 className="font-semibold text-[#181225] mb-2">Demo Features:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Connect your Slack profile</span>
              </li>
              <li className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span>Share restaurant recommendations</span>
              </li>
              <li className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-yellow-500" />
                <span>Get notifications about new reviews</span>
              </li>
              <li className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-purple-500" />
                <span>Sync your status and profile picture</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleDemoConnect}
            className="w-full bg-[#4A154B] text-white py-3 px-4 rounded-lg hover:bg-[#3a0f3a] transition-colors flex items-center justify-center space-x-2"
          >
            <Slack className="w-4 h-4" />
            <span>Start Demo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Demo Slack Profile */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
                alt="Demo Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-[#181225]">John Doe</h4>
                <p className="text-sm text-gray-600">@johndoe • 🍕 Hungry for good food!</p>
              </div>
            </div>
          </div>

          {/* Demo Messages */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#181225]">Recent Messages:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {demoMessages.map((msg) => (
                <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-[#181225]">{msg.user}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{msg.message}</p>
                  <span className="text-xs text-[#4A154B] font-medium">{msg.channel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Actions */}
          <div className="flex space-x-2">
            <button
              onClick={sendDemoMessage}
              className="flex-1 bg-[#4A154B] text-white py-2 px-4 rounded-lg hover:bg-[#3a0f3a] transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Demo Message</span>
            </button>
            <button
              onClick={handleDemoDisconnect}
              className="flex-1 bg-red-100 text-red-600 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
            >
              <span>End Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">To use real Slack integration:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Create a Slack app at api.slack.com/apps</li>
          <li>2. Configure OAuth & Permissions</li>
          <li>3. Add environment variables to .env file</li>
          <li>4. See SLACK_SETUP.md for detailed instructions</li>
        </ol>
      </div>
    </div>
  )
}

export default SlackDemo
