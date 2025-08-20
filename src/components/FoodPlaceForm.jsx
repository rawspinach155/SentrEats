import React, { useState } from 'react'
import { X, Star, Plus } from 'lucide-react'
import LocationAutocomplete from './LocationAutocomplete'

const FoodPlaceForm = ({ onSubmit, isOpen, onClose, onOpen, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: '',
    dietaryOptions: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      dairyFree: false,
      nutFree: false
    },
    price: '',
    cuisine: '',
    rating: 0,
    comment: ''
  })
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDietaryChange = (option) => {
    setFormData(prev => ({
      ...prev,
      dietaryOptions: {
        ...prev.dietaryOptions,
        [option]: !prev.dietaryOptions[option]
      }
    }))
  }

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      alert('Please log in to add eateries')
      return
    }
    
    console.log('Current user in form:', currentUser)
    console.log('Form data before adding userId:', formData)
    
    // Add userId and coordinates to formData
    const formDataWithUser = {
      ...formData,
      userId: currentUser.id,
      coordinates: selectedLocation ? {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      } : null
    }
    
    console.log('Form data with userId and coordinates:', formDataWithUser)
    console.log('Current user ID type:', typeof currentUser.id, 'Value:', currentUser.id)
    console.log('Rating type:', typeof formData.rating, 'Value:', formData.rating)
    console.log('Coordinates:', formDataWithUser.coordinates)
    
    // Validate the data before sending
    if (!currentUser.id || typeof currentUser.id !== 'number') {
      alert('Invalid user ID. Please log in again.')
      return
    }
    
    if (typeof formData.rating !== 'number' || formData.rating < 0 || formData.rating > 5) {
      alert('Invalid rating. Please select a rating between 0 and 5.')
      return
    }
    
    onSubmit(formDataWithUser)
    
    // Reset form
    setFormData({
      name: '',
      address: '',
      type: '',
      dietaryOptions: {
        glutenFree: false,
        vegan: false,
        vegetarian: false,
        dairyFree: false,
        nutFree: false
      },
      price: '',
      cuisine: '',
      rating: 0,
      images: [],
      comment: ''
    })
    setImagePreview([])
    setSelectedLocation(null)
  }

  const handleLocationSelected = (locationData) => {
    setSelectedLocation(locationData)
    // Update the address field with the formatted address
    setFormData(prev => ({
      ...prev,
      address: locationData ? locationData.formatted_address : ''
    }))
  }

  // Place type options including sweet places for sweet potato ratings
  const typeOptions = [
    'Restaurant', 'Cafe', 'Bar', 'Ice Cream Shop', 'Boba Shop', 'Bakery', 'Food Truck', 'Food Court', 'Diner', 'Pizzeria', 'Sushi Bar', 'Steakhouse', 'Other'
  ]
  
  const priceOptions = ['$', '$$', '$$$', '$$$$']
  const cuisineOptions = [
    'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian',
    'Mediterranean', 'French', 'Greek', 'Spanish', 'Korean', 'Vietnamese',
    'Middle Eastern', 'African', 'Caribbean', 'Other'
  ]

  // Dynamic color mapping for dietary options
  const dietaryColors = {
    glutenFree: { bg: '#fdb81b', hover: '#ffd00e', text: 'white', border: '#fdb81b' },
    vegan: { bg: '#ff70bc', hover: '#ff70bc', text: 'white', border: '#ff45a8' },
    vegetarian: { bg: '#ee8019', hover: '#fdb81b', text: 'white', border: '#ee8019' },
    dairyFree: { bg: '#6e47ae', hover: '#a737b4', text: 'white', border: '#6e47ae' },
    nutFree: { bg: '#4d0a55', hover: '#6e47ae', text: 'white', border: '#4d0a55' }
  }

  // Dynamic color mapping for price options - using your preferred color palette
  const priceColors = [
    { bg: '#fdb81b', hover: '#ffd00e', outline: '#fdb81b' }, // Dk Yellow to Lt Yellow
    { bg: '#ee8019', hover: '#fdb81b', outline: '#ee8019' }, // Dk Orange to Dk Yellow
    { bg: '#6e47ae', hover: '#a737b4', outline: '#6e47ae' }, // Lt Violet to Lt Purple
    { bg: '#4d0a55', hover: '#6e47ae', outline: '#4d0a55' }  // Dk Purple to Lt Violet
  ]

  // Check if place type is sweet/dessert related - Updated for sweet potato ratings
  const isSweetPlace = (type) => {
    const sweetTypes = ['Cafe', 'Ice Cream Shop', 'Boba Shop', 'Bakery']
    return sweetTypes.includes(type)
  }

  if (!isOpen) {
    if (!currentUser) {
      return (
        <div className="card text-center">
          <div className="text-[#382c5c] mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#382c5c] to-[#2a1f45] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img src="/sentry-glyph.png" alt="SentrEats Logo" className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold text-[#181225] mb-2 font-rubik">Login Required</h3>
            <p className="text-sm text-[#382c5c] mb-6">Please log in to add new eateries to your profile!</p>
          </div>
        </div>
      )
    }
    
    return (
      <div className="card text-center">
        <div className="text-[#382c5c] mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#382c5c] to-[#2a1f45] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img src="/sentry-glyph.png" alt="SentrEats Logo" className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-semibold text-[#181225] mb-2 font-rubik">Add New Eatery</h3>
          <p className="text-sm text-[#382c5c] mb-6">Click the button below to start adding your favorite restaurants!</p>
          
          <button
            onClick={onOpen}
            className="bg-gradient-to-r from-[#382c5c] to-[#2a1f45] hover:from-[#2a1f45] hover:to-[#1a142f] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Eatery</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card animate-bounce-in bg-gradient-to-br from-white to-[#f6f6f8] shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#181225] font-rubik">Add New Place</h2>
        <button
          onClick={onClose}
          className="text-[#382c5c] hover:text-[#2a1f45] transition-colors p-2 hover:bg-[#f6f6f8] rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-[#181225] mb-2 font-rubik">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="input-field font-rubik"
            placeholder="Enter eatery name"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-[#181225] mb-2 font-rubik">
            Address *
          </label>
          <LocationAutocomplete
            value={formData.address}
            onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
            onLocationSelected={handleLocationSelected}
            placeholder="Search for a location..."
            className="w-full"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-[#181225] mb-2 font-rubik">
            Place Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="input-field font-rubik"
          >
            <option value="">Select place type</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Dietary Options */}
        <div>
          <label className="block text-sm font-semibold text-[#181225] mb-3 font-rubik">
            Dietary Options
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(formData.dietaryOptions).map(([option, checked]) => {
              const colors = dietaryColors[option]
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleDietaryChange(option)}
                  className={`filter-btn ${
                    checked 
                      ? 'filter-btn-active' 
                      : 'filter-btn-inactive'
                  } font-rubik`}
                  style={{
                    backgroundColor: checked ? colors.bg : 'transparent',
                    border: `2px solid ${colors.border}`,
                    color: checked ? colors.text : colors.border
                  }}
                  onMouseEnter={(e) => {
                    if (!checked) {
                      e.target.style.backgroundColor = colors.hover
                      e.target.style.color = colors.text
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!checked) {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = colors.border
                    }
                  }}
                >
                  {option.replace(/([A-Z])/g, ' $1').replace('Free', 'free')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-[#181225] mb-2 font-rubik">
            Price Range *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {priceOptions.map((price, index) => {
              const colors = priceColors[index]
              return (
                <button
                  key={price}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, price }))}
                  className={`filter-btn font-rubik text-center ${
                    formData.price === price ? 'filter-btn-active' : 'filter-btn-inactive'
                  }`}
                  style={{
                    backgroundColor: formData.price === price ? colors.bg : 'transparent',
                    border: `2px solid ${colors.outline}`,
                    color: formData.price === price ? 'white' : colors.outline,
                    minWidth: '0',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.price !== price) {
                      e.target.style.backgroundColor = colors.hover
                      e.target.style.color = 'white'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.price !== price) {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = colors.outline
                    }
                  }}
                >
                  {price}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cuisine Type */}
        <div>
          <label className="block text-sm font-semibold text-[#181225] mb-2 font-rubik">
            Cuisine Type *
          </label>
          <select
            name="cuisine"
            value={formData.cuisine}
            onChange={handleInputChange}
            required
            className="input-field font-rubik"
          >
            <option value="">Select cuisine type</option>
            {cuisineOptions.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-[#181225] mb-2 font-rubik">
            Rating ({isSweetPlace(formData.type) ? 'Sweet Potatoes' : 'Potatoes'}) *
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                  star <= formData.rating
                    ? 'animate-pulse-glow' 
                    : 'hover:bg-[#f6f6f8]'
                }`}
              >
                <span className="text-3xl">
                  {isSweetPlace(formData.type) ? '🍠' : '🥔'}
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm text-[#382c5c] mt-2 font-rubik">
            {formData.rating > 0 ? `${formData.rating} ${isSweetPlace(formData.type) ? 'sweet potato' : 'potato'}${formData.rating > 1 ? 'es' : ''}` : 'Select rating'}
          </p>
        </div>

        {/* Comment Section */}
        <div>
          <label className="block text-sm font-semibold text-[#181225] mb-2 font-rubik">
            Food Recommendations & Notes
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            rows="4"
            className="input-field font-rubik"
            placeholder="Share your favorite dishes, must-try items, or any helpful tips about this place..."
          />
        </div>



        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#382c5c] to-[#2a1f45] hover:from-[#2a1f45] hover:to-[#1a142f] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl font-rubik"
          >
            Add Eatery
          </button>
        </div>
      </form>
    </div>
  )
}

export default FoodPlaceForm
