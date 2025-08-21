import React, { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

const Map = ({ eateries = [] }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const infowindowRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEatery, setSelectedEatery] = useState(null)
  const eateryMarkersRef = useRef([])

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      // Check if Google Maps API is already loaded and ready
      if (window.google && window.google.maps && window.google.maps.Map) {
        initMap()
        return
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        // Script is already loading, wait for it
        existingScript.addEventListener('load', () => {
          // Add a small delay to ensure the API is fully initialized
          setTimeout(initMap, 100)
        })
        return
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      
      console.log('Google Maps API Key:', apiKey ? 'Present' : 'Missing')
      
      if (!apiKey) {
        setError('Google Maps API key is missing. Please create a .env file with VITE_GOOGLE_MAPS_API_KEY=your_api_key')
        setIsLoading(false)
        return
      }
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        // Add a small delay to ensure the API is fully initialized
        setTimeout(initMap, 100)
      }
      script.onerror = () => {
        setError('Failed to load Google Maps API. Please check your internet connection and API key.')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    const initMap = () => {
      try {
        // Double-check that Google Maps API is fully loaded
        if (!window.google || !window.google.maps || !window.google.maps.Map) {
          console.error('Google Maps API not fully loaded')
          setError('Google Maps API failed to load properly. Please refresh the page.')
          setIsLoading(false)
          return
        }

        if (!mapRef.current) {
          console.error('Map container ref not available')
          setError('Map container not found')
          setIsLoading(false)
          return
        }

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

        // Create info window
        infowindowRef.current = new window.google.maps.InfoWindow()

        // Create marker
        markerRef.current = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          anchorPoint: new window.google.maps.Point(0, -29),
        })

        setIsLoading(false)
        
        // Create eatery markers after map is initialized
        createEateryMarkers()
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
      // Clear eatery markers
      eateryMarkersRef.current.forEach(marker => marker.setMap(null))
      eateryMarkersRef.current = []
    }
  }, [])

  // Function to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng) &&
      isFinite(lat) && isFinite(lng)
    )
  }

  // Function to group eateries by coordinates
  const groupEateriesByCoordinates = () => {
    const groups = {}
    
    eateries.forEach(eatery => {
      if (!eatery.coordinates || !isValidCoordinate(eatery.coordinates.lat, eatery.coordinates.lng)) {
        return // Skip invalid coordinates
      }
      
      const coordKey = `${eatery.coordinates.lat.toFixed(6)},${eatery.coordinates.lng.toFixed(6)}`
      
      if (!groups[coordKey]) {
        groups[coordKey] = {
          coordinates: eatery.coordinates,
          eateries: []
        }
      }
      
      groups[coordKey].eateries.push(eatery)
    })
    
    return Object.values(groups)
  }

  // Function to create eatery markers
  const createEateryMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return

    // Clear existing eatery markers
    eateryMarkersRef.current.forEach(marker => marker.setMap(null))
    eateryMarkersRef.current = []

    const coordinateGroups = groupEateriesByCoordinates()
    let totalEateries = 0
    let invalidCount = 0

    coordinateGroups.forEach(group => {
      const { coordinates, eateries } = group
      totalEateries += eateries.length

      // Create custom marker icon based on eatery type
      const getMarkerIcon = (eatery) => {
        const icons = {
          'Restaurant': '🍽️',
          'Cafe': '☕',
          'Bar': '🍺',
          'Ice Cream Shop': '🍦',
          'Boba Shop': '🧋',
          'Bakery': '🥐',
          'Food Truck': '🚚',
          'Food Court': '🏢',
          'Diner': '🍔',
          'Pizzeria': '🍕',
          'Sushi Bar': '🍣',
          'Steakhouse': '🥩'
        }
        return icons[eatery.type] || '📍'
      }

      // Create marker for each eatery
      eateries.forEach(eatery => {
        const marker = new window.google.maps.Marker({
          position: { 
            lat: coordinates.lat, 
            lng: coordinates.lng 
          },
          map: mapInstanceRef.current,
          title: eatery.name,
          label: {
            text: getMarkerIcon(eatery),
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'black'
          },
          animation: window.google.maps.Animation.DROP
        })

        // Create info window content for eatery with reviews
        const createInfoContent = (eatery) => {
          // Sort reviews by date (most recent first)
          const sortedReviews = eatery.reviews ? [...eatery.reviews].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          ) : []
          
          const mostRecentReview = sortedReviews[0]
          const otherReviews = sortedReviews.slice(1)
          
          const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }
          
          const renderRating = (rating, type) => {
            const isSweetPlace = ['Cafe', 'Ice Cream Shop', 'Boba Shop', 'Bakery'].includes(type)
            const emoji = isSweetPlace ? '🍠' : '🥔'
            return emoji.repeat(rating)
          }
          
          const getDietaryBadges = (dietaryOptions) => {
            const activeOptions = Object.entries(dietaryOptions)
              .filter(([_, isActive]) => isActive)
              .map(([option, _]) => option)
            
            if (activeOptions.length === 0) return ''
            
            return activeOptions.map(option => 
              `<span class="inline-block px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700 mr-1 mb-1">${option.replace(/([A-Z])/g, ' $1').replace('Free', 'free')}</span>`
            ).join('')
          }
          
          let content = `
            <div class="p-3 max-w-sm">
              <h3 class="font-semibold text-sm mb-1">${eatery.name}</h3>
              <p class="text-xs text-gray-600 mb-2">${eatery.address}</p>
              <div class="text-xs text-gray-500 mb-2">
                <span class="font-medium">${eatery.type}</span> • ${eatery.cuisine} • ${eatery.price}
              </div>
              <div class="text-xs text-gray-500 mb-2">
                ${sortedReviews.length} review${sortedReviews.length !== 1 ? 's' : ''}
              </div>
          `
          
          if (mostRecentReview) {
            content += `
              <div class="border-t border-gray-200 pt-2 mb-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium text-gray-700">Latest Review</span>
                  <span class="text-xs text-gray-500">${formatDate(mostRecentReview.createdAt)}</span>
                </div>
                <div class="text-xs text-gray-500 mb-1">
                  ${renderRating(mostRecentReview.rating, eatery.type)} (${mostRecentReview.rating}/5)
                </div>
                ${getDietaryBadges(mostRecentReview.dietaryOptions)}
                ${mostRecentReview.comment ? `<p class="text-xs text-gray-600 mt-1 italic">"${mostRecentReview.comment}"</p>` : ''}
                <div class="text-xs text-gray-500 mt-1">by ${mostRecentReview.createdBy}</div>
              </div>
            `
          }
          
          if (otherReviews.length > 0) {
            content += `
              <div class="border-t border-gray-200 pt-2">
                <div class="text-xs font-medium text-gray-700 mb-2">${otherReviews.length} more review${otherReviews.length !== 1 ? 's' : ''}</div>
                <div class="max-h-32 overflow-y-auto space-y-2">
            `
            
            otherReviews.slice(0, 3).forEach(review => {
              content += `
                <div class="text-xs border-b border-gray-100 pb-1 last:border-b-0">
                  <div class="flex items-center justify-between">
                    <span>${renderRating(review.rating, eatery.type)} (${review.rating}/5)</span>
                    <span class="text-gray-500">${formatDate(review.createdAt)}</span>
                  </div>
                  ${review.comment ? `<p class="text-gray-600 italic mt-1">"${review.comment}"</p>` : ''}
                  <div class="text-gray-500">by ${review.createdBy}</div>
                </div>
              `
            })
            
            if (otherReviews.length > 3) {
              content += `<div class="text-xs text-gray-500 italic">... and ${otherReviews.length - 3} more</div>`
            }
            
            content += `
                </div>
              </div>
            `
          }
          
          content += `</div>`
          return content
        }

        const infoWindow = new window.google.maps.InfoWindow({
          content: createInfoContent(eatery)
        })

        // Add click listener to marker
        marker.addListener('click', () => {
          // Close other info windows
          eateryMarkersRef.current.forEach(m => {
            if (m.infoWindow) m.infoWindow.close()
          })
          
          infoWindow.open(mapInstanceRef.current, marker)
          
          // Set selected eatery for bottom panel
          setSelectedEatery(eatery)
        })

        // Store marker and info window reference
        marker.infoWindow = infoWindow
        eateryMarkersRef.current.push(marker)
      })


    })

    // Log summary
    if (invalidCount > 0) {
      console.log(`Map: ${coordinateGroups.length} location pins displayed, ${totalEateries} total eateries, ${invalidCount} skipped due to invalid coordinates`)
    } else {
      console.log(`Map: ${coordinateGroups.length} location pins displayed, ${totalEateries} total eateries`)
    }
  }

  // Recreate eatery markers when eateries change
  useEffect(() => {
    if (mapInstanceRef.current && !isLoading) {
      createEateryMarkers()
    }
  }, [eateries, isLoading])

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
      

      
      {/* Selected Eatery Reviews Panel */}
      {selectedEatery && (
        <div className="px-6 mt-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Eatery Header */}
            <div className="bg-gradient-to-r from-[#382c5c] to-[#2a1f45] text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-rubik">{selectedEatery.name}</h3>
                  <p className="text-sm opacity-90 font-rubik">{selectedEatery.address}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-medium">{selectedEatery.type}</span>
                    <span className="text-xs opacity-75">•</span>
                    <span className="text-sm font-medium">{selectedEatery.cuisine}</span>
                    <span className="text-xs opacity-75">•</span>
                    <span className="text-sm font-medium">{selectedEatery.price}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEatery(null)}
                  className="text-white hover:text-gray-300 transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="p-4">
              {selectedEatery.reviews && selectedEatery.reviews.length > 0 ? (
                <div>
                  <h4 className="text-lg font-semibold text-[#181225] mb-4 font-rubik">
                    Reviews ({selectedEatery.reviews.length})
                  </h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedEatery.reviews
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((review) => (
                        <ReviewCard key={review.id} review={review} eateryType={selectedEatery.type} />
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📝</div>
                  <p className="text-gray-500 font-rubik">No reviews yet for this eatery</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="px-6 mt-6 text-sm text-gray-500 text-center">
        <p>📍 Click and drag to explore the map</p>
        <p>🔍 Use the zoom controls to get a closer look</p>
        <p>🗺️ Click on eatery markers to see details</p>
      </div>
    </div>
  )
}

// ReviewCard component for displaying individual reviews
const ReviewCard = ({ review, eateryType }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const renderRating = (rating, type) => {
    const isSweetPlace = ['Cafe', 'Ice Cream Shop', 'Boba Shop', 'Bakery'].includes(type)
    const emoji = isSweetPlace ? '🍠' : '🥔'
    return emoji.repeat(rating)
  }
  
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
      <div className="flex flex-wrap gap-1 mt-2">
        {activeOptions.map((option) => (
          <span
            key={option}
            className={`px-2 py-1 ${dietaryColors[option]} text-xs rounded-full font-semibold font-rubik`}
          >
            {option.replace(/([A-Z])/g, ' $1').replace('Free', 'free')}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="text-lg">
            {renderRating(review.rating, eateryType)}
          </div>
          <span className="text-sm text-gray-600 font-rubik">
            ({review.rating}/5)
          </span>
        </div>
        <span className="text-xs text-gray-500 font-rubik">
          {formatDate(review.createdAt)}
        </span>
      </div>
      
      {getDietaryBadges(review.dietaryOptions)}
      
      {review.comment && (
        <p className="text-sm text-gray-700 mt-2 font-rubik leading-relaxed">
          "{review.comment}"
        </p>
      )}
      
      <div className="text-xs text-gray-500 mt-2 font-rubik">
        Reviewed by {review.createdBy}
      </div>
    </div>
  )
}

export default Map
