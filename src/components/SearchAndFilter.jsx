import React, { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'

const SearchAndFilter = ({ onSearch, onFilter, isVisible, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    dietaryOptions: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      dairyFree: false,
      nutFree: false
    },
    cuisines: [],
    placeTypes: [],
    priceRange: [],
    rating: 0
  })

  const cuisineOptions = [
    'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian',
    'Mediterranean', 'French', 'Greek', 'Spanish', 'Korean', 'Vietnamese',
    'Middle Eastern', 'African', 'Caribbean', 'Other'
  ]

  const placeTypeOptions = [
    'Restaurant', 'Cafe', 'Bar', 'Ice Cream Shop', 'Boba Shop', 'Bakery', 
    'Food Truck', 'Food Court', 'Diner', 'Pizzeria', 'Sushi Bar', 'Steakhouse', 'Other'
  ]

  const priceOptions = ['$', '$$', '$$$', '$$$$']

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  const handleDietaryChange = (option) => {
    setFilters(prev => ({
      ...prev,
      dietaryOptions: {
        ...prev.dietaryOptions,
        [option]: !prev.dietaryOptions[option]
      }
    }))
  }

  const handleCuisineChange = (cuisine) => {
    setFilters(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }))
  }

  const handlePlaceTypeChange = (type) => {
    setFilters(prev => ({
      ...prev,
      placeTypes: prev.placeTypes.includes(type)
        ? prev.placeTypes.filter(t => t !== type)
        : [...prev.placeTypes, type]
    }))
  }

  const handlePriceChange = (price) => {
    setFilters(prev => ({
      ...prev,
      priceRange: prev.priceRange.includes(price)
        ? prev.priceRange.filter(p => p !== price)
        : [...prev.priceRange, price]
    }))
  }

  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating
    }))
  }

  const applyFilters = () => {
    onFilter(filters)
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      dietaryOptions: {
        glutenFree: false,
        vegan: false,
        vegetarian: false,
        dairyFree: false,
        nutFree: false
      },
      cuisines: [],
      placeTypes: [],
      priceRange: [],
      rating: 0
    });
    onFilter({});
  }

  const hasActiveFilters = () => {
    return (
      Object.values(filters.dietaryOptions).some(Boolean) ||
      filters.cuisines.length > 0 ||
      filters.placeTypes.length > 0 ||
      filters.priceRange.length > 0 ||
      filters.rating > 0
    )
  }

  if (!isVisible) return null

  return (
    <div className="bg-white border-b border-[#e8e8ea] shadow-sm animate-slide-down">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search Bar */}
          <div className="flex-1 relative animate-fade-in">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for eateries, cuisines, or locations..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#382c5c] focus:border-transparent transition-all duration-200 font-rubik"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 font-rubik animate-scale-in ${
              hasActiveFilters()
                ? 'bg-[#382c5c] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters() && (
              <span className="bg-white text-[#382c5c] text-xs px-2 py-1 rounded-full font-bold">
                {Object.values(filters.dietaryOptions).filter(Boolean).length +
                  filters.cuisines.length +
                  filters.placeTypes.length +
                  filters.priceRange.length +
                  (filters.rating > 0 ? 1 : 0)}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Close Button */}
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors animate-fade-in self-end sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 md:p-6 bg-gray-50 rounded-xl border border-gray-200 animate-scale-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              
              {/* Dietary Options */}
              <div>
                <h3 className="font-semibold text-[#181225] mb-3 font-rubik">Dietary Preferences</h3>
                <div className="space-y-2">
                  {Object.entries(filters.dietaryOptions).map(([option, isActive]) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleDietaryChange(option)}
                        className="rounded border-gray-300 text-[#382c5c] focus:ring-[#382c5c]"
                      />
                      <span className="text-sm text-gray-700 font-rubik capitalize">
                        {option.replace(/([A-Z])/g, ' $1').replace('Free', 'free')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuisines */}
              <div>
                <h3 className="font-semibold text-[#181225] mb-3 font-rubik">Cuisines</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cuisineOptions.map((cuisine) => (
                    <label key={cuisine} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.cuisines.includes(cuisine)}
                        onChange={() => handleCuisineChange(cuisine)}
                        className="rounded border-gray-300 text-[#382c5c] focus:ring-[#382c5c]"
                      />
                      <span className="text-sm text-gray-700 font-rubik">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Place Types */}
              <div>
                <h3 className="font-semibold text-[#181225] mb-3 font-rubik">Place Types</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {placeTypeOptions.map((type) => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.placeTypes.includes(type)}
                        onChange={() => handlePlaceTypeChange(type)}
                        className="rounded border-gray-300 text-[#382c5c] focus:ring-[#382c5c]"
                      />
                      <span className="text-sm text-gray-700 font-rubik">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price & Rating */}
              <div>
                <h3 className="font-semibold text-[#181225] mb-3 font-rubik">Price & Rating</h3>
                
                {/* Price Range */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2 font-rubik">Price Range</h4>
                  <div className="space-y-2">
                    {priceOptions.map((price) => (
                      <label key={price} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.priceRange.includes(price)}
                          onChange={() => handlePriceChange(price)}
                          className="rounded border-gray-300 text-[#382c5c] focus:ring-[#382c5c]"
                        />
                        <span className="text-sm text-gray-700 font-rubik">{price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2 font-rubik">Minimum Rating</h4>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className={`text-2xl transition-all duration-200 ${
                          star <= filters.rating ? 'text-[#fdb81b]' : 'text-gray-300'
                        } hover:text-[#fdb81b] hover:scale-110`}
                      >
                        🍠
                      </button>
                    ))}
                    {filters.rating > 0 && (
                      <span className="text-sm text-gray-600 ml-2 font-rubik">
                        ({filters.rating}+)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 font-medium font-rubik"
              >
                Clear All Filters
              </button>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-rubik"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-6 py-2 bg-[#382c5c] text-white rounded-lg hover:bg-[#2a1f45] transition-colors font-rubik"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchAndFilter
