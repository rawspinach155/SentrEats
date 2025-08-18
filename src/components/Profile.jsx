import React, { useState } from 'react'
import { User, Settings, LogOut, Edit3, MapPin, Star, Trash2, Plus } from 'lucide-react'

const Profile = ({ eateries = [], onDelete = () => {}, onAddNew = () => {} }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Food enthusiast and restaurant explorer'
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original data
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
          <img
            src={profileData.avatar}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
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
            <p className="text-gray-500 mt-2">{profileData.bio}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382c5c]"
            />
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2a1f45]"
            />
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382c5c] resize-none"
              rows="2"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
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
        <div className="text-center p-3 bg-[#f6f6f8] rounded-lg">
          <div className="text-2xl font-bold text-[#382c5c]">
            {eateries.filter(place => place.dietaryOptions && place.dietaryOptions.vegan).length}
          </div>
          <div className="text-sm text-gray-600">Vegan</div>
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
                    <div className="flex items-center justify-between">
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
              className="flex-1 bg-[#382c5c] text-white py-2 px-4 rounded-lg hover:bg-[#2a1f45] transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        
        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        
        <button className="w-full bg-red-100 text-red-600 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Profile
