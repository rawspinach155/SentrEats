import React from 'react'
import { Plus } from 'lucide-react'

const Header = ({ onAddNew }) => {
  return (
    <header className="bg-white shadow-lg border-b border-[#e8e8ea]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7553ff] to-[#4e2a9a] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">🍽️</span>
            </div>
            <h1 className="text-3xl font-bold text-[#181225] font-rubik">SentrEats</h1>
          </div>
          
          <button
            onClick={onAddNew}
            className="bg-gradient-to-r from-[#7553ff] to-[#4e2a9a] hover:from-[#4e2a9a] hover:to-[#36166b] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Place</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
