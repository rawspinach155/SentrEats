import React, { useState, useEffect } from 'react'
import FoodPlaceForm from './components/FoodPlaceForm'
import FoodPlaceList from './components/FoodPlaceList'
import Header from './components/Header'
import Map from './components/Map'
import Profile from './components/Profile'
import SignupModal from './components/SignupModal'
import LoginModal from './components/LoginModal'
import { useAuth } from './hooks/useAuth'
import { buildApiUrl, API_ENDPOINTS } from './config/api'

function App() {
  const [eateries, setEateries] = useState([])
  const [filteredEateries, setFilteredEateries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  
  // Use the auth hook
  const { isAuthenticated, currentUser, login, logout, signup } = useAuth()

  // API call to health endpoint
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.HEALTH))
        const data = await response.json()
        console.log('Health API response:', data)
      } catch (error) {
        console.error('Health API error:', error)
      }
    }
    
    checkHealth()
  }, [])

  // API call to get all users
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch(buildApiUrl(`${API_ENDPOINTS.USERS}/get-all-users`))
        const data = await response.json()
        console.log('Users API response:', data)
      } catch (error) {
        console.error('Users API error:', error)
      }
    }
    
    getUsers()
  }, [])

  // Automatically fetch eateries when component mounts
  useEffect(() => {
    fetchEateries()
  }, [])

  // Apply search and filters whenever they change
  useEffect(() => {
    applySearchAndFilters()
  }, [searchTerm, activeFilters, eateries])

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

    setFilteredEateries(filtered)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilter = (filters) => {
    setActiveFilters(filters)
  }

  const addEatery = async (newPlace) => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.EATERIES), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlace)
      })

      const data = await response.json()

      if (response.ok) {
        // Add the new eatery to local state
        setEateries(prev => [...prev, data.eatery])
        setShowForm(false)
        console.log('Eatery added successfully:', data.eatery)
      } else {
        console.error('Failed to add eatery:', data.error)
      }
    } catch (error) {
        console.error('Error adding eatery:', error)
    }
  }

  const deleteEatery = (id) => {
    setEateries(eateries.filter(place => place.id !== id))
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSignupClick = () => {
    setShowSignupModal(true)
  }

  const handleSignupSuccess = (user) => {
    signup({ email: user.email, name: user.name })
    console.log('User signed up successfully:', user)
  }

  const handleLoginClick = () => {
    setShowLoginModal(true)
  }

  const handleLoginSuccess = (user) => {
    login(user)
    console.log('User logged in successfully:', user)
  }

  const handleLogoutClick = () => {
    logout()
    console.log('User logged out successfully')
  }

  const fetchEateries = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.EATERIES))
      const data = await response.json()

      if (response.ok) {
        setEateries(data.eateries)
        console.log('Eateries fetched successfully:', data.eateries)
      } else {
        console.error('Failed to fetch eateries:', data.error)
      }
    } catch (error) {
      console.error('Error fetching eateries:', error)
    }
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
        currentUser={currentUser}
        onLogout={handleLogoutClick}
      />
    }
    
    return (
      <FoodPlaceList 
        eateries={filteredEateries} 
        onDelete={deleteEatery}
        totalEateries={eateries.length}
        hasActiveFilters={searchTerm.trim() !== '' || Object.keys(activeFilters).some(key => {
          if (key === 'dietaryOptions') {
            return Object.values(activeFilters.dietaryOptions).some(Boolean)
          }
          return Array.isArray(activeFilters[key]) ? activeFilters[key].length > 0 : activeFilters[key] > 0
        })}
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
          onOpen={() => setShowForm(true)}
        />
      )
    }
    
    return null
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Header 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSignupClick={handleSignupClick}
        onLoginClick={handleLoginClick}
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

          {/* Search Summary */}
          {(searchTerm.trim() !== '' || Object.keys(activeFilters).some(key => {
            if (key === 'dietaryOptions') {
              return Object.values(activeFilters.dietaryOptions).some(Boolean)
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
      
      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignupSuccess={handleSignupSuccess}
      />
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}

export default App
