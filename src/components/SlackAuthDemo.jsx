import React, { useState } from 'react'
import { Slack, LogIn, User, Shield, ArrowRight, CheckCircle } from 'lucide-react'

const SlackAuthDemo = ({ onAuthSuccess, onAuthError, isSignUp = false }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState('initial') // initial, connecting, success

  const handleDemoSignIn = async () => {
    setIsLoading(true)
    setStep('connecting')
    
    // Simulate OAuth flow
    setTimeout(() => {
      setStep('success')
      
      // Create mock user data
      const mockUser = {
        id: 'U1234567890',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        profile: {
          real_name: 'John Doe',
          display_name: 'johndoe',
          email: 'john.doe@example.com',
          image_192: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          status_emoji: '🍕',
          status_text: 'Hungry for good food!'
        },
        teamId: 'T1234567890',
        teamName: 'Demo Team',
        signedInAt: new Date().toISOString()
      }

      // Store user data
      localStorage.setItem('slackUser', JSON.stringify(mockUser))
      localStorage.setItem('slackConnection', JSON.stringify({
        profile: mockUser.profile,
        accessToken: 'demo-token',
        teamId: mockUser.teamId,
        connectedAt: new Date().toISOString()
      }))

      // Call success callback
      if (onAuthSuccess) {
        onAuthSuccess(mockUser)
      }
    }, 2000)
  }

  if (step === 'connecting') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A154B] mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[#181225] mb-2">Connecting to Slack...</h2>
          <p className="text-gray-600">Authenticating your account</p>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#181225] mb-2">Successfully Signed In!</h2>
          <p className="text-gray-600">Welcome to SentrEats</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-[#4A154B] rounded-full flex items-center justify-center">
          <Slack className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#181225] mb-2">
          {isSignUp ? 'Sign Up with Slack' : 'Sign In with Slack'}
        </h2>
        <p className="text-gray-600">
          {isSignUp 
            ? 'Create your account using your Slack workspace' 
            : 'Sign in using your Slack workspace'
          }
        </p>
        <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          Demo Mode
        </div>
      </div>

      <div className="space-y-4">
        {/* Benefits */}
        <div className="bg-[#f6f6f8] rounded-lg p-4">
          <h4 className="font-semibold text-[#181225] mb-2">Why sign in with Slack?</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#4A154B] rounded-full"></div>
              <span>One-click authentication</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#4A154B] rounded-full"></div>
              <span>Sync with your team</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#4A154B] rounded-full"></div>
              <span>Share recommendations easily</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#4A154B] rounded-full"></div>
              <span>No password to remember</span>
            </li>
          </ul>
        </div>

        {/* Demo Sign In Button */}
        <button
          onClick={handleDemoSignIn}
          disabled={isLoading}
          className="w-full bg-[#4A154B] text-white py-3 px-4 rounded-lg hover:bg-[#3a0f3a] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Slack className="w-4 h-4" />
          <span>
            {isLoading 
              ? 'Connecting...' 
              : (isSignUp ? 'Demo Sign Up' : 'Demo Sign In')
            }
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Demo Notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Demo Mode:</strong> This simulates the Slack OAuth flow. 
            In production, this would redirect to Slack for real authentication.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SlackAuthDemo
