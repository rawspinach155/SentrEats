import React from 'react'
import { User, MapPin, Home, LogOut, Search } from 'lucide-react'
import SearchAndFilter from './SearchAndFilter'

const Header = ({ activeTab, onTabChange, onLogoutClick, isAuthenticated, currentUser, onSearch, onFilter }) => {
  const [showSearch, setShowSearch] = React.useState(false)

  const toggleSearch = () => {
    setShowSearch(!showSearch)
  }

  // Generate consistent avatar color based on user name (fallback)
  const getAvatarColor = (name) => {
    if (!name) return '#7553ff'
    const brandColors = ['#7553ff', '#ff45a8', '#ee8019', '#fdb81b', '#92dd00', '#226dfc']
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return brandColors[Math.abs(hash) % brandColors.length]
  }

  return (
    <>
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
                  style={{ display: 'flex' }}
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Profile</span>
                </button>
              </div>
            </div>
            
            {/* Right: Search and Auth Buttons */}
            <div className="flex items-center justify-end space-x-3">
              {/* Search Toggle Button */}
              <button
                onClick={toggleSearch}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 font-rubik ${
                  showSearch
                    ? 'bg-[#382c5c] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
              
              {/* User is logged in - show user info and logout */}
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                  style={{ backgroundColor: currentUser?.avatarColor || getAvatarColor(currentUser?.name) }}
                >
                  <img
                    src="/sentry-glyph.png"
                    alt="User Avatar"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                
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
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Component */}
      <SearchAndFilter
        isVisible={showSearch}
        onToggle={toggleSearch}
        onSearch={onSearch}
        onFilter={onFilter}
      />
    </>
  )
}

export default Header
