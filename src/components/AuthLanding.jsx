import React, { useState } from 'react'
import { User, Lock, Mail, Users, Coffee, Star } from 'lucide-react'
import SignupModal from './SignupModal'
import LoginModal from './LoginModal'

const AuthLanding = ({ onSignupSuccess, onLoginSuccess }) => {
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleSignupClick = () => {
    setShowSignupModal(true)
  }

  const handleLoginClick = () => {
    setShowLoginModal(true)
  }

  const handleSignupSuccess = (user) => {
    setShowSignupModal(false)
    onSignupSuccess(user)
  }

  const handleLoginSuccess = (user) => {
    setShowLoginModal(false)
    onLoginSuccess(user)
  }

  const handleSwitchToLogin = () => {
    setShowSignupModal(false)
    setShowLoginModal(true)
  }

  const handleSwitchToSignup = () => {
    setShowLoginModal(false)
    setShowSignupModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f6f8] to-[#e8e8ea] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-gradient-to-br from-[#382c5c] to-[#2a1f45] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <img src="/sentry-glyph.png" alt="SentrEats Logo" className="w-20 h-20" />
          </div>
          <h1 className="text-6xl font-bold text-[#382c5c] mb-4 font-rubik">
            Code <span className="inline-block origin-right animate-swing-down">breaks</span>, fix it faster
          </h1>
          <p className="text-2xl text-[#FDB81B] font-medium font-rubik mb-6">
            (after lunch)
          </p>
          <p className="text-xl text-[#181225] font-rubik max-w-2xl mx-auto">
            Join the community of developers who know that great code starts with great food. 
            Discover, share, and rate the best eateries around.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#ff45a8] to-[#ff70bc] rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#181225] mb-3 font-rubik">Discover Places</h3>
            <p className="text-[#382c5c] font-rubik">
              Find the best restaurants, cafes, and food spots recommended by fellow developers
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#fdb81b] to-[#ffd00e] rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#181225] mb-3 font-rubik">Rate & Review</h3>
            <p className="text-[#382c5c] font-rubik">
              Share your experiences and help others find the perfect spot for their next meal
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6e47ae] to-[#a737b4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#181225] mb-3 font-rubik">Join Community</h3>
            <p className="text-[#382c5c] font-rubik">
              Connect with other developers and build your personal food recommendation network
            </p>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <button
              onClick={handleSignupClick}
              className="bg-gradient-to-r from-[#382c5c] to-[#2a1f45] hover:from-[#2a1f45] hover:to-[#1a142f] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-3 text-lg min-w-[200px] justify-center"
            >
              <User className="w-6 h-6" />
              <span>Create Account</span>
            </button>
            
            <button
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-[#ff45a8] to-[#ff70bc] hover:from-[#ff70bc] hover:to-[#ff45a8] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-3 text-lg min-w-[200px] justify-center"
            >
              <Lock className="w-6 h-6" />
              <span>Sign In</span>
            </button>
          </div>
          
          <p className="text-[#382c5c] font-rubik">
            Join thousands of developers who've already discovered their favorite spots!
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-[#382c5c] font-rubik">
          <p className="text-sm">
            Built with ❤️ by developers, for developers
          </p>
        </div>
      </div>

      {/* Modals */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={handleSwitchToSignup}
      />
    </div>
  )
}

export default AuthLanding
