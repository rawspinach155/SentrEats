import React from 'react'
import { MapPin, Trash2, Star } from 'lucide-react'

const FoodPlaceList = ({ eateries, onDelete, totalEateries, hasActiveFilters, currentUser }) => {
  if (eateries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-28 h-28 bg-gradient-to-br from-[#382c5c] to-[#2a1f45] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <img src="/sentry-glyph.png" alt="SentrEats Logo" className="w-16 h-16" />
        </div>
        <h3 className="text-2xl font-semibold text-[#181225] mb-3 font-rubik">
          {hasActiveFilters ? 'No Results Found' : 'No Eateries Yet'}
        </h3>
        <p className="text-[#382c5c] font-rubik">
          {hasActiveFilters 
            ? 'Try adjusting your search or filters to find more eateries.' 
            : 'Start adding your favorite restaurants to see them here!'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#181225] font-rubik">All Eateries</h2>
      
      <div className="grid gap-6">
        {eateries.map((place) => (
          <FoodPlaceCard key={place.id} place={place} onDelete={onDelete} currentUser={currentUser} />
        ))}
      </div>
    </div>
  )
}

const FoodPlaceCard = ({ place, onDelete, currentUser }) => {
  const getDietaryBadges = (dietaryOptions) => {
    const activeOptions = Object.entries(dietaryOptions)
      .filter(([_, isActive]) => isActive)
      .map(([option, _]) => option)
    
    if (activeOptions.length === 0) return null

    const dietaryColors = {
      glutenFree: 'bg-[#fdb81b] text-white',
      vegan: 'bg-[#ff70bc] text-white',
      vegetarian: 'bg-[#ee8019] text-white',
      dairyFree: 'bg-[#6e47ae] text-white',
      nutFree: 'bg-[#4d0a55] text-white'
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
        <span className="text-sm text-[#382c5c] ml-2 font-rubik">
          ({rating}/5 {isSweetPlace(type) ? 'sweet potatoes' : 'potatoes'})
        </span>
      </div>
    )
  }

  const getPriceColor = (price) => {
    const priceColors = {
      '$': 'text-[#fdb81b]',
      '$$': 'text-[#ee8019]',
      '$$$': 'text-[#6e47ae]',
      '$$$$': 'text-[#4d0a55]'
    }
    return priceColors[price] || 'text-[#382c5c]'
  }

  const getCuisineColor = () => {
    const colors = ['bg-[#382c5c]', 'bg-[#6e47ae]', 'bg-[#a737b4]', 'bg-[#4d0a55]', 'bg-[#36166b]']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getTypeColor = (type) => {
    const typeColors = {
      'Restaurant': 'bg-[#382c5c]',
      'Cafe': 'bg-[#ff70bc]',
      'Bar': 'bg-[#36166b]',
      'Ice Cream Shop': 'bg-[#ff70bc]',
      'Boba Shop': 'bg-[#a737b4]',
      'Bakery': 'bg-[#fdb81b]',
      'Food Truck': 'bg-[#ee8019]',
      'Food Court': 'bg-[#6e47ae]',
      'Diner': 'bg-[#ee8019]',
      'Pizzeria': 'bg-[#ff70bc]',
      'Sushi Bar': 'bg-[#6e47ae]',
      'Steakhouse': 'bg-[#4d0a55]',
      'Other': 'bg-[#382c5c]'
    }
    return typeColors[type] || 'bg-[#382c5c]'
  }

  return (
    <div className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-[#f6f6f8] border-[#e8e8ea]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-[#181225] font-rubik">{place.name}</h3>
            {place.createdBy && (
              <span className="text-sm text-[#382c5c] bg-[#f6f6f8] px-3 py-1 rounded-full font-medium font-rubik">
                Added by {place.createdBy}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-[#382c5c] mb-4">
            <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-[#382c5c]" />
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
            <div className="mb-4 p-4 bg-gradient-to-r from-[#f6f6f8] to-white rounded-lg border-l-4 border-[#382c5c]">
              <h4 className="text-sm font-semibold text-[#181225] mb-2 font-rubik flex items-center">
                <span className="text-[#382c5c] mr-2">💬</span>
                Food Recommendations & Notes
              </h4>
              <p className="text-sm text-[#382c5c] font-rubik leading-relaxed">
                {place.comment}
              </p>
            </div>
          )}
        </div>
        
        {currentUser && place.userId === currentUser.id && (
          <button
            onClick={() => onDelete(place.id)}
            className="text-[#ff45a8] hover:text-[#ff70bc] transition-all duration-200 p-3 hover:bg-[#ff45a8] hover:bg-opacity-10 rounded-xl hover:scale-110"
            title="Delete place"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        )}
      </div>
      

    </div>
  )
}

export default FoodPlaceList
