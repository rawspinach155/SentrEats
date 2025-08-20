import React, { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import AuthLanding from './components/AuthLanding'
import Header from './components/Header'
import Map from './components/Map'
import FoodPlaceForm from './components/FoodPlaceForm'
import FoodPlaceList from './components/FoodPlaceList'
import Profile from './components/Profile'
import { buildApiUrl, API_ENDPOINTS } from './config/api'

function App() {
  // All hooks must be called at the top, before any conditional logic
  const { isAuthenticated, currentUser, login, logout, signup, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('home')
  const [showForm, setShowForm] = useState(false)
  const [eateries, setEateries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [filteredEateries, setFilteredEateries] = useState([])
  
  // Fetch eateries when component mounts - this hook is always called
  useEffect(() => {
    if (isAuthenticated) {
      fetchEateries()
    }
  }, [isAuthenticated])

  // Apply search and filters whenever they change
  useEffect(() => {
    applySearchAndFilters()
  }, [searchTerm, activeFilters, eateries])

  const fetchEateries = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.EATERIES))
      const data = await response.json()
      if (response.ok) {
        setEateries(data.eateries || [])
        console.log('Eateries fetched:', data.eateries)
      }
    } catch (error) {
      console.error('Error fetching eateries:', error)
    }
  }

  const applySearchAndFilters = () => {
    let filtered = [...eateries]

    // Apply search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(searchLower) ||
        place.address.toLowerCase().includes(searchLower) ||
        place.cuisine.toLowerCase().includes(searchLower) ||
        place.type.toLowerCase().includes(searchLower)
      )
    }

    // Apply dietary filters
    if (activeFilters.dietaryOptions) {
      Object.entries(activeFilters.dietaryOptions).forEach(([option, isActive]) => {
        if (isActive) {
          filtered = filtered.filter(place => place.dietaryOptions?.[option])
        }
      })
    }

    // Apply cuisine filters
    if (activeFilters.cuisines && activeFilters.cuisines.length > 0) {
      filtered = filtered.filter(place => 
        activeFilters.cuisines.includes(place.cuisine)
      )
    }

    // Apply place type filters
    if (activeFilters.placeTypes && activeFilters.placeTypes.length > 0) {
      filtered = filtered.filter(place => 
        activeFilters.placeTypes.includes(place.type)
      )
    }

    // Apply price filters
    if (activeFilters.priceRange && activeFilters.priceRange.length > 0) {
      filtered = filtered.filter(place => 
        activeFilters.priceRange.includes(place.price)
      )
    }

    // Apply rating filter
    if (activeFilters.rating && activeFilters.rating > 0) {
      filtered = filtered.filter(place => 
        place.rating >= activeFilters.rating
      )
    }

    // Sort by most recently added (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB - dateA // Newest first
    })

    setFilteredEateries(filtered)
  }
  
  console.log('App.jsx: Test - isAuthenticated:', isAuthenticated, 'currentUser:', currentUser)
  
  // If user is not authenticated, show the auth landing page
  if (!isAuthenticated) {
    console.log('App.jsx: User not authenticated, showing AuthLanding')
    return (
      <AuthLanding
        onSignupSuccess={(user) => signup({ email: user.email, name: user.name })}
        onLoginSuccess={(user) => login(user)}
      />
    )
  }
  
  console.log('App.jsx: User authenticated, showing app')
  
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleLogoutClick = () => {
    logout()
    setActiveTab('home')
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilter = (filters) => {
    setActiveFilters(filters)
  }

  const addEatery = async (newPlace) => {
    try {
      console.log('Adding eatery:', newPlace)
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.EATERIES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlace)
      })

      const data = await response.json()
      console.log('Backend response:', data)

      if (response.ok) {
        setEateries(prev => [...prev, data.eatery])
        setShowForm(false)
        console.log('Eatery added successfully')
      } else {
        alert('Failed to add eatery: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding eatery:', error)
      alert('Error adding eatery. Please try again.')
    }
  }

  const deleteEatery = async (id) => {
    const eatery = eateries.find(place => place.id === id)
    
    if (!eatery || eatery.userId !== currentUser?.id) {
      alert('You can only delete your own eateries')
      return
    }
    
    try {
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.EATERIES}/${id}`), {
        method: 'DELETE'
      })

      if (response.ok) {
        setEateries(eateries.filter(place => place.id !== id))
        console.log('Eatery deleted successfully')
      } else {
        alert('Failed to delete eatery')
      }
    } catch (error) {
      console.error('Error deleting eatery:', error)
      alert('Error deleting eatery. Please try again.')
    }
  }

  const renderMainContent = () => {
    if (activeTab === 'map') {
      return <Map eateries={filteredEateries} />
    }
    
    if (activeTab === 'profile') {
      return (
        <Profile 
          eateries={eateries.filter(eatery => eatery.userId === currentUser?.id)}
          onDelete={deleteEatery}
          onAddNew={() => setShowForm(true)}
          currentUser={currentUser}
          onLogout={handleLogoutClick}
          onProfileUpdate={(updatedUser) => {
            // Update the auth context with the new user data
            console.log('Profile update received in App:', updatedUser)
            // Call updateProfile to update localStorage and currentUser state
            updateProfile(updatedUser)
          }}
        />
      )
    }
    
    return (
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

        {/* Search Summary */}
        {(searchTerm.trim() !== '' || Object.keys(activeFilters).some(key => {
          if (key === 'dietaryOptions') {
            return Object.values(activeFilters[key]).some(Boolean)
          }
          return Array.isArray(activeFilters[key]) ? activeFilters[key].length > 0 : activeFilters[key] > 0
        })) && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#181225] font-rubik">
                Search & Filter Results
              </h3>
              <p className="text-sm text-gray-600 font-rubik">
                Found {filteredEateries.length} eateries matching your criteria
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <FoodPlaceList 
              eateries={filteredEateries} 
              onDelete={deleteEatery}
              totalEateries={eateries.length}
              currentUser={currentUser}
              hasActiveFilters={searchTerm.trim() !== '' || Object.keys(activeFilters).some(key => {
                if (key === 'dietaryOptions') {
                  return Object.values(activeFilters[key]).some(Boolean)
                }
                return Array.isArray(activeFilters[key]) ? activeFilters[key].length > 0 : activeFilters[key] > 0
              })}
            />
          </div>
          
          {/* Side Content */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <FoodPlaceForm 
                onSubmit={addEatery}
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onOpen={() => setShowForm(true)}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Header 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogoutClick={handleLogoutClick}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onSearch={handleSearch}
        onFilter={handleFilter}
        searchTerm={searchTerm}
        activeFilters={activeFilters}
      />
      
      {activeTab === 'map' ? (
        <div className="w-full">
          {renderMainContent()}
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {renderMainContent()}
        </div>
      )}
    </div>
  )
}

export default App
