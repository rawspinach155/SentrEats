import React, { useState } from 'react'
import FoodPlaceForm from './components/FoodPlaceForm'
import FoodPlaceList from './components/FoodPlaceList'
import Header from './components/Header'

function App() {
  const [foodPlaces, setFoodPlaces] = useState([])
  const [showForm, setShowForm] = useState(false)

  const addFoodPlace = (newPlace) => {
    setFoodPlaces([...foodPlaces, { ...newPlace, id: Date.now() }])
    setShowForm(false)
  }

  const deleteFoodPlace = (id) => {
    setFoodPlaces(foodPlaces.filter(place => place.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <Header onAddNew={() => setShowForm(true)} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <FoodPlaceList 
              foodPlaces={foodPlaces} 
              onDelete={deleteFoodPlace}
            />
          </div>
          
          {/* Side Profile */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <FoodPlaceForm 
                onSubmit={addFoodPlace}
                isOpen={showForm}
                onClose={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
