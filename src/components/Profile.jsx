import React, { useState, useEffect } from 'react'
import { User, Settings, LogOut, Edit3, MapPin, Star, Trash2, Plus } from 'lucide-react'
import { buildApiUrl, API_ENDPOINTS } from '../config/api'

const Profile = ({ eateries = [], onDelete = () => {}, onAddNew = () => {}, currentUser, onLogout, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: '',
    avatarColor: ''
  })

  // Brand colors for avatar backgrounds - limited selection for users
  const brandColors = [
    '#7553ff', // Blurple
    '#ff45a8', // Dark Pink
    '#ee8019', // Dark Orange
    '#fdb81b', // Dark Yellow
    '#92dd00', // Dark Green
    '#226dfc'  // Dark Blue
  ]

  // Generate consistent avatar color based on user name
  const getAvatarColor = (name) => {
    if (!name) return brandColors[0]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return brandColors[Math.abs(hash) % brandColors.length]
  }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load user data when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        avatarColor: currentUser.avatarColor || getAvatarColor(currentUser.name || '')
      })
    }
  }, [currentUser])

  const handleSave = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    console.log('Saving profile with data:', {
      currentUser: currentUser,
      profileData: profileData,
      userId: currentUser?.id
    });

    try {
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.USERS}/profile`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': currentUser.id.toString()
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          avatarColor: profileData.avatarColor
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        
        // Create updated user object
        const updatedUser = {
          ...currentUser,
          name: profileData.name,
          email: profileData.email,
          avatarColor: profileData.avatarColor
        }
        
        // Call the callback to update parent component
        if (onProfileUpdate) {
          console.log('Profile: Calling onProfileUpdate with:', updatedUser)
          onProfileUpdate(updatedUser)
        }
        
        // Also update the local state immediately for instant UI feedback
        setProfileData({
          name: profileData.name,
          email: profileData.email,
          avatarColor: profileData.avatarColor
        })
        
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original user data
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        avatarColor: currentUser.avatarColor || getAvatarColor(currentUser.name || '')
      })
    }
    setError('')
    setSuccess('')
  }

  const getRatingEmoji = (type, rating) => {
    const isSweetPlace = ['Cafe', 'Ice Cream Shop', 'Boba Shop', 'Bakery'].includes(type)
    return isSweetPlace ? '🍠'.repeat(rating) : '🥔'.repeat(rating)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div 
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
            style={{ backgroundColor: profileData.avatarColor || getAvatarColor(profileData.name) }}
          >
            <img
              src="/sentry-glyph.png"
              alt="Profile"
              className="w-12 h-12 object-contain"
            />
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 bg-[#382c5c] text-white p-2 rounded-full hover:bg-[#2a1f45] transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
        
        {!isEditing ? (
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-[#181225]">{profileData.name}</h2>
            <p className="text-gray-600">{profileData.email}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {/* Avatar Preview in Edit Mode */}
            <div className="flex justify-center mb-3">
              <div 
                className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center"
                style={{ backgroundColor: profileData.avatarColor || getAvatarColor(profileData.name) }}
              >
                <img
                  src="/sentry-glyph.png"
                  alt="Profile Preview"
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>
            
            {/* Color Picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-rubik text-center">
                Choose Avatar Color
              </label>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-3">
                  {brandColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setProfileData({...profileData, avatarColor: color})}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        profileData.avatarColor === color 
                          ? 'border-[#382c5c] scale-110 shadow-lg' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Color: ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382c5c]"
              placeholder="Enter your name"
            />
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a1f45]"
              placeholder="Enter your email"
            />
          </div>
        )}
        
        {/* Error and Success Messages */}
        {error && (
          <div className="mt-3 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 text-green-500 text-sm bg-green-50 p-3 rounded-lg">
            {success}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-[#f6f6f8] rounded-lg">
          <div className="text-2xl font-bold text-[#382c5c]">{eateries.length}</div>
          <div className="text-sm text-gray-600">Places</div>
        </div>
        <div className="text-center p-3 bg-[#f6f6f8] rounded-lg">
          <div className="text-2xl font-bold text-[#382c5c]">
            {eateries.length > 0 ? (eateries.reduce((sum, place) => sum + (place.rating || 0), 0) / eateries.length).toFixed(1) : 0}
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
      </div>

      {/* My Restaurants Section */}
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#181225]">My Eateries</h3>
        </div>
        
        {eateries.length === 0 ? (
          <div className="text-center py-8 bg-[#f6f6f8] rounded-lg">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-gray-600 mb-2">No eateries added yet</p>
            <p className="text-sm text-gray-500">Start building your eatery collection!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {eateries.map((place) => (
              <div key={place.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#181225] mb-1">{place.name}</h4>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{place.address}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-[#382c5c] text-white px-2 py-1 rounded">
                          {place.type}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {place.cuisine}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">{getRatingEmoji(place.type, place.rating)}</span>
                      </div>
                    </div>
                    
                    {/* Dietary Options */}
                    {place.dietaryOptions && Object.values(place.dietaryOptions).some(Boolean) && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(place.dietaryOptions).map(([option, isActive]) => {
                          if (!isActive) return null
                          
                          const dietaryColors = {
                            glutenFree: 'bg-[#fdb81b] text-white',
                            vegan: 'bg-[#ff70bc] text-white',
                            vegetarian: 'bg-[#ee8019] text-white',
                            dairyFree: 'bg-[#6e47ae] text-white',
                            nutFree: 'bg-[#4d0a55] text-white'
                          }
                          
                          return (
                            <span
                              key={option}
                              className={`px-2 py-1 ${dietaryColors[option]} text-xs rounded-full font-semibold shadow-sm font-rubik`}
                            >
                              {option.replace(/([A-Z])/g, ' $1').replace('Free', 'free')}
                            </span>
                          )
                        })}
                      </div>
                    )}
                    

                  </div>
                  <button
                    onClick={() => onDelete(place.id)}
                    className="ml-2 text-red-500 hover:text-red-700 transition-colors p-1"
                    title="Delete eatery"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Actions */}
      <div className="space-y-3">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-[#382c5c] text-white py-2 px-4 rounded-lg hover:bg-[#2a1f45] transition-colors flex items-center justify-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-[#382c5c] text-white py-2 px-4 rounded-lg hover:bg-[#2a1f45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        )}
        
        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full bg-red-100 text-red-600 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Profile
