import React, { useState } from 'react'
import { User, Settings, LogOut, Edit3 } from 'lucide-react'

const Profile = () => {
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <img
            src={profileData.avatar}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <button className="absolute bottom-0 right-0 bg-[#382c5c] text-white p-2 rounded-full hover:bg-[#2a1f45] transition-colors">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382c5c]"
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
