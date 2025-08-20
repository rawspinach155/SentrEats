import React, { useState, useRef, useEffect } from 'react'
import { Search, MapPin, X } from 'lucide-react'

const LocationAutocomplete = ({ 
  value, 
  onChange, 
  onLocationSelected, 
  placeholder = "Search for a location...",
  disabled = false,
  className = ""
}) => {
  const [predictions, setPredictions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Search locations using OpenStreetMap Nominatim API (free)
  const searchLocations = async (query) => {
    if (!query.trim()) {
      setPredictions([])
      return
    }

    setIsLoading(true)
    
    try {
      // Build search parameters for San Francisco area (more flexible)
      const params = new URLSearchParams({
        format: 'json',
        q: `${query} San Francisco`,
        limit: '5',
        addressdetails: '1',
        countrycodes: 'us'
      })

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setPredictions(data)
        setShowDropdown(true)
      } else {
        console.error('Search failed:', response.status)
        // Fallback to broader search if SF-specific search fails
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=us`
        )
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          setPredictions(fallbackData)
          setShowDropdown(true)
        } else {
          setPredictions([])
        }
      }
    } catch (error) {
      console.error('Error searching locations:', error)
      setPredictions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value && value.trim()) {
        searchLocations(value)
      } else {
        setPredictions([])
        setShowDropdown(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [value])

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)
    
    if (!newValue.trim()) {
      setPredictions([])
      setShowDropdown(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || predictions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : predictions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handleSelectLocation(predictions[selectedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle location selection
  const handleSelectLocation = (location) => {
    setIsLoading(true)
    setShowDropdown(false)
    setSelectedIndex(-1)

    try {
      // Create location object
      const locationData = {
        place_id: location.place_id,
        name: location.name || location.display_name.split(',')[0],
        formatted_address: location.display_name,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
        address_components: parseAddressComponents(location.address)
      }

      // Update input with selected location
      onChange(location.display_name)
      
      // Call parent callback
      onLocationSelected(locationData)
      
      setPredictions([])
    } catch (error) {
      console.error('Error selecting location:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Parse address components from Nominatim response
  const parseAddressComponents = (address) => {
    if (!address) return {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    }

    return {
      street: address.road || address.street || '',
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      postal_code: address.postcode || '',
      country: address.country || ''
    }
  }

  // Handle input focus
  const handleFocus = () => {
    if (predictions.length > 0) {
      setShowDropdown(true)
    }
  }

  // Handle input blur
  const handleBlur = () => {
    // Delay closing to allow for clicks on suggestions
    setTimeout(() => {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }, 200)
  }

  // Clear search
  const clearSearch = () => {
    onChange('')
    setPredictions([])
    setShowDropdown(false)
    setSelectedIndex(-1)
    onLocationSelected(null)
  }

  // Format display name for better readability
  const formatDisplayName = (displayName) => {
    const parts = displayName.split(', ')
    if (parts.length <= 3) return displayName
    
    // Show first 3 parts for better readability
    return parts.slice(0, 3).join(', ') + '...'
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382c5c] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="location-predictions"
          aria-activedescendant={selectedIndex >= 0 ? `prediction-${selectedIndex}` : undefined}
        />
        
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#382c5c]"></div>
          </div>
        )}
        
        {value && !isLoading && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Predictions Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          id="location-predictions"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {predictions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              id={`prediction-${index}`}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-[#382c5c] text-white' : ''
              }`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelectLocation(prediction)}
            >
              <div className="flex items-start space-x-3">
                <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  index === selectedIndex ? 'text-white' : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {prediction.name || prediction.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {formatDisplayName(prediction.display_name)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {prediction.type} • {prediction.class}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && predictions.length === 0 && value && value.trim() && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No locations found
        </div>
      )}

      {/* API attribution (required for free use) */}
      <div className="mt-1 text-xs text-gray-400">
        Powered by <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
      </div>
    </div>
  )
}

export default LocationAutocomplete
