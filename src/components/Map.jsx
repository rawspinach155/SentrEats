import React, { useEffect, useRef, useState } from 'react'
import { Search, MapPin } from 'lucide-react'

const Map = () => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const searchInputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const markerRef = useRef(null)
  const infowindowRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlace, setSelectedPlace] = useState(null)

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap()
        return
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      
      console.log('Google Maps API Key:', apiKey ? 'Present' : 'Missing')
      
      if (!apiKey) {
        setError('Google Maps API key is missing. Please check your environment configuration.')
        setIsLoading(false)
        return
      }
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initMap
      script.onerror = () => {
        setError('Failed to load Google Maps API. Please check your internet connection and API key.')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    const initMap = () => {
      try {
        if (mapRef.current && window.google) {
          const defaultLocation = { lat: 37.7912, lng: -122.3971 } // SF as default
          
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: defaultLocation,
            zoom: 13,
            mapTypeControl: false,
            styles: [
              {
                featureType: 'poi.business',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          })

          // Initialize autocomplete
          if (searchInputRef.current && window.google.maps.places) {
            const options = {
              fields: ["formatted_address", "geometry", "name"],
              strictBounds: false,
            }

            autocompleteRef.current = new window.google.maps.places.Autocomplete(
              searchInputRef.current,
              options
            )

            // Bind the map's bounds to the autocomplete object
            autocompleteRef.current.bindTo("bounds", mapInstanceRef.current)

            // Create info window
            infowindowRef.current = new window.google.maps.InfoWindow()

            // Create marker
            markerRef.current = new window.google.maps.Marker({
              map: mapInstanceRef.current,
              anchorPoint: new window.google.maps.Point(0, -29),
            })

            // Add place_changed listener
            autocompleteRef.current.addListener("place_changed", () => {
              infowindowRef.current.close()
              markerRef.current.setVisible(false)

              const place = autocompleteRef.current.getPlace()

              if (!place.geometry || !place.geometry.location) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                window.alert("No details available for input: '" + place.name + "'")
                return
              }

              // If the place has a geometry, then present it on a map.
              if (place.geometry.viewport) {
                mapInstanceRef.current.fitBounds(place.geometry.viewport)
              } else {
                mapInstanceRef.current.setCenter(place.geometry.location)
                mapInstanceRef.current.setZoom(17)
              }

              markerRef.current.setPosition(place.geometry.location)
              markerRef.current.setVisible(true)

              // Update state with selected place
              setSelectedPlace({
                name: place.name,
                address: place.formatted_address,
                location: place.geometry.location
              })

              // Create info window content
              const content = `
                <div class="p-3 max-w-xs">
                  <h3 class="font-semibold text-sm mb-1">${place.name}</h3>
                  <p class="text-xs text-gray-600">${place.formatted_address}</p>
                </div>
              `

              infowindowRef.current.setContent(content)
              infowindowRef.current.open(mapInstanceRef.current, markerRef.current)
            })
          }

          setIsLoading(false)
        }
      } catch (err) {
        console.error('Map initialization error:', err)
        setError(`Failed to initialize map: ${err.message}`)
        setIsLoading(false)
      }
    }

    loadGoogleMaps()

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
    }
  }, [])

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-[#181225] mb-2">Map Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#382c5c] text-white px-4 py-2 rounded-lg hover:bg-[#2a1f45] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-center py-8 px-6">
        <h2 className="text-3xl font-bold text-[#181225] mb-3">Eateries Map</h2>
        <p className="text-gray-600 text-lg">Explore eateries in your area</p>
      </div>
      
      <div className="relative px-6">
        {/* Search Input */}
        <div className="absolute top-4 left-4 z-10 w-80">
          <div className="bg-white rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for a location..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#382c5c] focus:border-transparent"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        <div 
          ref={mapRef} 
          className="w-full rounded-lg border border-gray-200 shadow-lg"
          style={{ height: '70vh', minHeight: '500px' }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#382c5c] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Selected Place Info */}
      {selectedPlace && (
        <div className="px-6 mt-4">
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-[#382c5c] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-[#181225] mb-1">{selectedPlace.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedPlace.address}</p>
                <div className="text-xs text-gray-500">
                  Coordinates: {selectedPlace.location.lat().toFixed(6)}, {selectedPlace.location.lng().toFixed(6)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="px-6 mt-6 text-sm text-gray-500 text-center">
        <p>📍 Click and drag to explore the map</p>
        <p>🔍 Use the zoom controls to get a closer look</p>
        <p>🔎 Type in the search box to find locations</p>
      </div>
    </div>
  )
}

export default Map
