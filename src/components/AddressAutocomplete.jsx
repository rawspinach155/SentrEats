import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Globe } from 'lucide-react'

const AddressAutocomplete = ({ value, onChange, placeholder = "Enter address...", className = "" }) => {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)

  // Real address search using OpenStreetMap Nominatim API
  const searchAddresses = async (query) => {
    if (query.length < 3) return []
    
    try {
      setIsLoading(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=us`
      )
      
      if (response.ok) {
        const data = await response.json()
        return data.map(item => ({
          display: item.display_name,
          lat: item.lat,
          lon: item.lon,
          type: item.type
        }))
      }
    } catch (error) {
      console.log('Address search error:', error)
    } finally {
      setIsLoading(false)
    }
    
    return []
  }

  const handleInputChange = async (e) => {
    const newValue = e.target.value
    onChange(newValue)
    
    if (newValue.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Search for real addresses
    const results = await searchAddresses(newValue)
    setSuggestions(results)
    setShowSuggestions(results.length > 0)
  }

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.display)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#382c5c] focus:border-transparent transition-all ${className}`}
          autoComplete="off"
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#382c5c]"></div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <div className="text-left">
                  <div className="text-sm text-gray-700 font-medium">
                    {suggestion.display.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {suggestion.display.split(',').slice(1).join(',').trim()}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
