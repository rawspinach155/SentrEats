import React, { useEffect, useRef, useState } from 'react'

const Map = ({ eateries = [] }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [geocodingStatus, setGeocodingStatus] = useState({})
  const [failedEateries, setFailedEateries] = useState([])
  
  // Debug: Log when eateries prop changes
  useEffect(() => {
    console.log('🗺️ Map component received eateries:', eateries.length, 'items')
    if (eateries.length > 0) {
      console.log('🍽️ First eatery:', eateries[0])
    }
  }, [eateries])

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap()
        return
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      
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
            styles: [
              {
                featureType: 'poi.business',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          })

          // Initialize geocoding for all eateries
          console.log('🗺️ Starting to geocode eateries...')
          console.log('📊 Eateries data received:', eateries.length, 'items')
          const geocoder = new window.google.maps.Geocoder()
          
          if (eateries.length === 0) {
            console.log('📝 No eateries to geocode - waiting for data...')
            setIsLoading(false)
            return
          }
          
          // Process each eatery
          eateries.forEach((eatery, index) => {
            if (!eatery.address) {
              console.log(`⚠️ ${eatery.name} has no address`)
              setGeocodingStatus(prev => ({ ...prev, [eatery.name]: 'no-address' }))
              return
            }
            
            console.log(`📍 Geocoding ${eatery.name} at ${eatery.address}`)
            setGeocodingStatus(prev => ({ ...prev, [eatery.name]: 'processing' }))
            
            // Try to geocode the address
            geocoder.geocode({ address: eatery.address }, (results, status) => {
              console.log(`📍 ${eatery.name} geocoding result:`, { status, results: results?.length || 0 })
              
              if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location
                const position = { lat: location.lat(), lng: location.lng() }
                
                console.log(`✅ ${eatery.name} geocoded successfully to:`, position)
                setGeocodingStatus(prev => ({ ...prev, [eatery.name]: 'success' }))
                
                // Create custom marker icon
                const markerIcon = {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#382c5c" stroke="white" stroke-width="2"/>
                      <circle cx="20" cy="20" r="8" fill="#FDB81B"/>
                      <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🍽️</text>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: new window.google.maps.Point(20, 20)
                }
                
                // Create marker
                const marker = new window.google.maps.Marker({
                  position: position,
                  map: mapInstanceRef.current,
                  title: eatery.name,
                  icon: markerIcon,
                  animation: window.google.maps.Animation.DROP
                })
                
                // Center map on first successful eatery
                if (index === 0) {
                  mapInstanceRef.current.setCenter(position)
                  mapInstanceRef.current.setZoom(14)
                }
                
                console.log(`📍 Marker added for ${eatery.name}`)
              } else {
                console.log(`❌ ${eatery.name} geocoding failed:`, status)
                setGeocodingStatus(prev => ({ ...prev, [eatery.name]: 'failed' }))
                
                // Add to failed eateries list
                setFailedEateries(prev => [...prev, eatery])
              }
            })
          })

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
  }, [eateries])

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
      
      <div className="px-6 mt-6 text-sm text-gray-500 text-center">
        <p>📍 Click and drag to explore the map</p>
        <p>🔍 Use the zoom controls to get a closer look</p>
      </div>

      {/* Failed Geocoding Results */}
      {failedEateries.length > 0 && (
        <div className="px-6 mt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-3">
              ❌ Addresses That Couldn't Be Mapped ({failedEateries.length})
            </h3>
            <div className="space-y-2">
              {failedEateries.map((eatery, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-red-100">
                  <div>
                    <p className="font-medium text-gray-900">{eatery.name}</p>
                    <p className="text-sm text-red-600">{eatery.address}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Geocoding Failed
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-red-600 mt-3">
              These eateries couldn't be located on the map. Check if the addresses are correct and complete.
            </p>
          </div>
        </div>
      )}

      {/* Geocoding Status Summary */}
      {Object.keys(geocodingStatus).length > 0 && (
        <div className="px-6 mt-4">
          <h4 className="text-sm font-semibold text-[#181225] mb-2">Geocoding Summary:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <span className="text-green-800">✅ Successfully Mapped: </span>
              <span className="font-medium">
                {Object.values(geocodingStatus).filter(status => status === 'success').length}
              </span>
            </div>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <span className="text-red-800">❌ Failed to Map: </span>
              <span className="font-medium">
                {Object.values(geocodingStatus).filter(status => status === 'failed').length}
              </span>
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <span className="text-yellow-800">⚠️ No Address: </span>
              <span className="font-medium">
                {Object.values(geocodingStatus).filter(status => status === 'no-address').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Map
