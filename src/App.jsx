import React, { useState, useEffect } from 'react'
import FoodPlaceForm from './components/FoodPlaceForm'
import FoodPlaceList from './components/FoodPlaceList'
import Header from './components/Header'
import Map from './components/Map'
import Profile from './components/Profile'
import eateryService from './services/eateryService'

function App() {
  const [eateries, setEateries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load eateries on component mount
  useEffect(() => {
    loadEateries()
  }, [])

  const loadEateries = async () => {
    try {
      setIsLoading(true)
      const data = await eateryService.getAllEateries()
      setEateries(data)
      setError(null)
    } catch (err) {
      console.error('Error loading eateries:', err)
      setError('Failed to load eateries')
    } finally {
      setIsLoading(false)
    }
  }

  const addEatery = async (newPlace) => {
    try {
      const savedEatery = await eateryService.addEatery(newPlace)
      setEateries(prev => [...prev, savedEatery])
      setShowForm(false)
      setError(null)
    } catch (err) {
      console.error('Error adding eatery:', err)
      setError('Failed to add eatery')
    }
  }

  const deleteEatery = async (id) => {
    try {
      await eateryService.deleteEatery(id)
      setEateries(prev => prev.filter(place => place.id !== id))
      setError(null)
    } catch (err) {
      console.error('Error deleting eatery:', err)
      setError('Failed to delete eatery')
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const renderMainContent = () => {
    if (activeTab === 'map') {
      return <Map />
    }
    
    if (activeTab === 'profile') {
      return <Profile 
        eateries={eateries}
        onDelete={deleteEatery}
        onAddNew={() => setShowForm(true)}
      />
    }
    
    return (
      <FoodPlaceList 
        eateries={eateries} 
        onDelete={deleteEatery}
      />
    )
  }

  const renderSideContent = () => {
    if (activeTab === 'home') {
      return (
        <FoodPlaceForm 
          onSubmit={addEatery}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
        />
      )
    }
    
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#382c5c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your eateries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Header 
        onAddNew={() => setShowForm(true)} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4 mt-4">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'map' ? (
        <div className="w-full">
          {renderMainContent()}
        </div>
      ) : activeTab === 'profile' ? (
        <div className="container mx-auto px-4 py-8">
          <div className="lg:col-span-3">
            {renderMainContent()}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Slogan Section */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-6xl font-bold text-[#382c5c] mb-2 font-rubik">
              Code <span className="inline-block origin-right animate-swing-down">breaks</span>, fix it faster
            </h1>
            <p className="text-xl text-[#FDB81B] font-medium font-rubik">
              (after lunch)
            </p>
          </div>

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
