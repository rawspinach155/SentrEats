import React, { useState } from 'react'
import FoodPlaceForm from './components/FoodPlaceForm'
import FoodPlaceList from './components/FoodPlaceList'
import Header from './components/Header'
import Map from './components/Map'
import Profile from './components/Profile'

function App() {
  const [foodPlaces, setFoodPlaces] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showProfile, setShowProfile] = useState(false)

  const addFoodPlace = (newPlace) => {
    setFoodPlaces([...foodPlaces, { ...newPlace, id: Date.now() }])
    setShowForm(false)
  }

  const deleteFoodPlace = (id) => {
    setFoodPlaces(foodPlaces.filter(place => place.id !== id))
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setShowProfile(false)
  }

  const handleProfileClick = () => {
    setShowProfile(!showProfile)
  }

  const renderMainContent = () => {
    if (activeTab === 'map') {
      return <Map />
    }
    
    return (
      <FoodPlaceList 
        foodPlaces={foodPlaces} 
        onDelete={deleteFoodPlace}
      />
    )
  }

  const renderSideContent = () => {
    if (showProfile) {
      return <Profile />
    }
    
    if (activeTab === 'home') {
      return (
        <FoodPlaceForm 
          onSubmit={addFoodPlace}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
        />
      )
    }
    
    return null
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Header 
        onAddNew={() => setShowForm(true)} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onProfileClick={handleProfileClick}
      />
      
      {activeTab === 'map' ? (
        <div className="w-full">
          {renderMainContent()}
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {renderMainContent()}
            </div>
            
            {/* Side Content */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {renderSideContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
