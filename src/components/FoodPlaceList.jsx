import React from 'react'
import { MapPin, Trash2, Star } from 'lucide-react'

const FoodPlaceList = ({ foodPlaces, onDelete }) => {
  if (foodPlaces.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-28 h-28 bg-gradient-to-br from-[#7553ff] to-[#4e2a9a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-5xl">🍽️</span>
        </div>
        <h3 className="text-2xl font-semibold text-[#181225] mb-3 font-rubik">No Food Places Yet</h3>
        <p className="text-[#6e47ae] font-rubik">Start adding your favorite restaurants to see them here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#181225] font-rubik">Your Food Places</h2>
      
      <div className="grid gap-6">
        {foodPlaces.map((place) => (
          <FoodPlaceCard key={place.id} place={place} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

const FoodPlaceCard = ({ place, onDelete }) => {
  const getDietaryBadges = (dietaryOptions) => {
    const activeOptions = Object.entries(dietaryOptions)
      .filter(([_, isActive]) => isActive)
      .map(([option, _]) => option)
    
    if (activeOptions.length === 0) return null

    const dietaryColors = {
      glutenFree: 'bg-[#92dd00] text-[#181225]',
      vegan: 'bg-[#ff45a8] text-white',
      vegetarian: 'bg-[#fdb81b] text-[#181225]',
      dairyFree: 'bg-[#226dfc] text-white',
      nutFree: 'bg-[#a737b4] text-white'
    }

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {activeOptions.map((option) => (
          <span
            key={option}
            className={`px-3 py-1 ${dietaryColors[option]} text-xs rounded-full font-semibold shadow-md font-rubik`}
          >
            {option.replace(/([A-Z])/g, ' $1').replace('Free', 'free')}
          </span>
        ))}
      </div>
    )
  }

  const renderRating = (rating, type) => {
    // Check if place type is sweet/dessert related
    const isSweetPlace = (type) => {
      const sweetTypes = ['Cafe', 'Ice Cream Shop', 'Boba Shop', 'Bakery']
      return sweetTypes.includes(type)
    }
    
    const emoji = isSweetPlace(type) ? '🍠' : '🥔'
    
    return (
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${
              star <= rating ? 'text-[#fdb81b] animate-pulse' : 'text-[#e8e8ea]'
            }`}
          >
            {emoji}
          </span>
        ))}
        <span className="text-sm text-[#6e47ae] ml-2 font-rubik">
          ({rating}/5 {isSweetPlace(type) ? 'sweet potatoes' : 'potatoes'})
        </span>
      </div>
    )
  }

  const getPriceColor = (price) => {
    const priceColors = {
      '$': 'text-[#92dd00]',
      '$$': 'text-[#fdb81b]',
      '$$$': 'text-[#ff9838]',
      '$$$$': 'text-[#ff45a8]'
    }
    return priceColors[price] || 'text-[#7553ff]'
  }

  const getCuisineColor = () => {
    const colors = ['bg-[#7553ff]', 'bg-[#4e2a9a]', 'bg-[#a737b4]', 'bg-[#6e47ae]', 'bg-[#36166b]']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getTypeColor = (type) => {
    const typeColors = {
      'Restaurant': 'bg-[#7553ff]',
      'Cafe': 'bg-[#ff45a8]',
      'Bar': 'bg-[#4e2a9a]',
      'Ice Cream Shop': 'bg-[#ff70bc]',
      'Boba Shop': 'bg-[#a737b4]',
      'Bakery': 'bg-[#fdb81b]',
      'Food Truck': 'bg-[#92dd00]',
      'Food Court': 'bg-[#226dfc]',
      'Diner': 'bg-[#ff9838]',
      'Pizzeria': 'bg-[#ff45a8]',
      'Sushi Bar': 'bg-[#3edcff]',
      'Steakhouse': 'bg-[#36166b]',
      'Other': 'bg-[#6e47ae]'
    }
    return typeColors[type] || 'bg-[#6e47ae]'
  }

  return (
    <div className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-[#f6f6f8] border-[#e8e8ea]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-[#181225] mb-3 font-rubik">{place.name}</h3>
          
          <div className="flex items-center text-[#6e47ae] mb-4">
            <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-[#7553ff]" />
            <span className="text-sm font-rubik">{place.address}</span>
          </div>
          
          <div className="flex items-center space-x-4 mb-4">
            <span className={`text-xl font-bold ${getPriceColor(place.price)} font-rubik`}>
              {place.price}
            </span>
            <span className={`px-4 py-2 ${getTypeColor(place.type)} text-white text-sm rounded-full font-semibold shadow-md font-rubik`}>
              {place.type}
            </span>
            <span className={`px-4 py-2 ${getCuisineColor()} text-white text-sm rounded-full font-semibold shadow-md font-rubik`}>
              {place.cuisine}
            </span>
          </div>
          
          {getDietaryBadges(place.dietaryOptions)}
          
          <div className="mb-4">
            {renderRating(place.rating, place.type)}
          </div>
          
          {/* Comment Section */}
          {place.comment && (
            <div className="mb-4 p-4 bg-gradient-to-r from-[#f6f6f8] to-white rounded-lg border-l-4 border-[#7553ff]">
              <h4 className="text-sm font-semibold text-[#181225] mb-2 font-rubik flex items-center">
                <span className="text-[#7553ff] mr-2">💬</span>
                Food Recommendations & Notes
              </h4>
              <p className="text-sm text-[#6e47ae] font-rubik leading-relaxed">
                {place.comment}
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => onDelete(place.id)}
          className="text-[#ff45a8] hover:text-[#ff70bc] transition-all duration-200 p-3 hover:bg-[#ff45a8] hover:bg-opacity-10 rounded-xl hover:scale-110"
          title="Delete place"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>
      
      {/* Images */}
      {place.images && place.images.length > 0 && (
        <div className="border-t border-[#e8e8ea] pt-4">
          <h4 className="text-sm font-semibold text-[#181225] mb-3 font-rubik">Photos</h4>
          <div className="grid grid-cols-3 gap-3">
            {place.images.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                <img
                  src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                  alt={`${place.name} photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FoodPlaceList
