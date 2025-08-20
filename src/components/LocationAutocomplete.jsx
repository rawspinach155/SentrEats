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
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true)
        return
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        console.error('Google Maps API key is missing')
        return
      }
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setIsGoogleMapsLoaded(true)
      script.onerror = () => console.error('Failed to load Google Maps API')
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isGoogleMapsLoaded && inputRef.current && !autocompleteRef.current) {
      const options = {
        fields: ["formatted_address", "geometry", "name", "place_id"],
        strictBounds: false,
        componentRestrictions: { country: 'us' }
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options
      )

      // Add place_changed listener
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace()

        if (!place.geometry || !place.geometry.location) {
          console.warn("No details available for selected place")
          return
        }

        // Create location object
        const locationData = {
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address_components: parseGoogleAddressComponents(place)
        }

        // Update input with selected location
        onChange(place.formatted_address)
        
        // Call parent callback
        onLocationSelected(locationData)
        
        // Update state
        setHasSelectedLocation(true)
        setShowDropdown(false)
        setPredictions([])
      })
    }
  }, [isGoogleMapsLoaded, onChange, onLocationSelected])

  // Parse Google Places address components
  const parseGoogleAddressComponents = (place) => {
    const components = place.address_components || []
    const result = {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    }

    components.forEach(component => {
      const types = component.types
      if (types.includes('street_number') || types.includes('route')) {
        result.street += component.long_name + ' '
      } else if (types.includes('locality')) {
        result.city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        result.state = component.short_name
      } else if (types.includes('postal_code')) {
        result.postal_code = component.long_name
      } else if (types.includes('country')) {
        result.country = component.long_name
      }
    })

    result.street = result.street.trim()
    return result
  }

  // Handle input changes for Google Places Autocomplete
  useEffect(() => {
    if (value && value.trim()) {
      setHasSelectedLocation(false)
    } else {
      setHasSelectedLocation(false)
    }
  }, [value])

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    setHasSelectedLocation(false) // Reset selection when user starts typing
  }







  // Clear search
  const clearSearch = () => {
    onChange('')
    setHasSelectedLocation(false)
    onLocationSelected(null)
  }



  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382c5c] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        

        
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Google Places API attribution */}
      <div className="mt-1 text-xs text-gray-400">
        Powered by <a href="https://developers.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a>
      </div>
    </div>
  )
}

export default LocationAutocomplete
