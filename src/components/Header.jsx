import React from 'react'
import { Plus, User, MapPin, Home, LogIn, LogOut } from 'lucide-react'

const Header = ({ onAddNew, activeTab, onTabChange, onSignupClick, onLoginClick, onLogoutClick, isAuthenticated, currentUser }) => {
  return (
    <header className="bg-white shadow-lg border-b border-[#e8e8ea] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="SentrEats Logo" className="h-12 w-auto" />
          </div>
          
          {/* Center: Navigation Tabs */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => onTabChange('home')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-white text-[#382c5c] shadow-md'
                  : 'text-gray-600 hover:text-[#382c5c] hover:bg-white/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </button>
            
            <button
              onClick={() => onTabChange('map')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'map'
                  ? 'bg-white text-[#382c5c] shadow-md'
                  : 'text-gray-600 hover:text-[#382c5c] hover:bg-white/50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Map</span>
            </button>
            
            <button
              onClick={() => onTabChange('profile')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-white text-[#382c5c] shadow-md'
                  : 'text-gray-600 hover:text-[#382c5c] hover:bg-white/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="font-medium">Profile</span>
            </button>
            </div>
          </div>
          
          {/* Right: Add New Place Button and Auth Buttons */}
          <div className="flex items-center justify-end space-x-3">
            {activeTab === 'home' && isAuthenticated && (
              <button
                onClick={onAddNew}
                className="bg-gradient-to-r from-[#382c5c] to-[#2a1f45] hover:from-[#2a1f45] hover:to-[#1a142f] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Eatery</span>
              </button>
            )}
            
            {isAuthenticated ? (
              // User is logged in - show user info and logout
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#382c5c]">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
                <button
                  onClick={onLogoutClick}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              // User is not logged in - show login and signup
              <>
                <button
                  onClick={onLoginClick}
                  className="bg-white border-2 border-[#382c5c] text-[#382c5c] hover:bg-[#382c5c] hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Log In</span>
                </button>
                
                <button
                  onClick={onSignupClick}
                  className="bg-gradient-to-r from-[#382c5c] to-[#2a1f45] hover:from-[#2a1f45] hover:to-[#1a142f] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <User className="w-5 h-5" />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
