import React, { useState } from 'react'
import FoodPlaceForm from './components/FoodPlaceForm'
import FoodPlaceList from './components/FoodPlaceList'
import Header from './components/Header'
import Map from './components/Map'
import Profile from './components/Profile'

function App() {
  const [eateries, setEateries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  const addEatery = (newPlace) => {
    setEateries([...eateries, { ...newPlace, id: Date.now() }])
    setShowForm(false)
  }

  const deleteEatery = (id) => {
    setEateries(eateries.filter(place => place.id !== id))
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

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Header 
        onAddNew={() => setShowForm(true)} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
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
