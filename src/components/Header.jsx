import React, { useState } from 'react'
import { Plus, User, MapPin, Home } from 'lucide-react'

const Header = ({ onAddNew, activeTab, onTabChange, onProfileClick }) => {
  return (
    <header className="bg-white shadow-lg border-b border-[#e8e8ea] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="SentrEats Logo" className="h-12 w-auto" />
          </div>
          
          {/* Navigation Tabs */}
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
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onAddNew}
              className="bg-gradient-to-r from-[#382c5c] to-[#2a1f45] hover:from-[#2a1f45] hover:to-[#1a142f] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Place</span>
            </button>
            
            {/* Profile Button */}
            <button
              onClick={onProfileClick}
              className="w-12 h-12 bg-gradient-to-br from-[#382c5c] to-[#2a1f45] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <User className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
