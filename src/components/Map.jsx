import React, { useCallback, useEffect, useRef, useState } from 'react'

const Map = ({ eateries = [] }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [geocodingStatus, setGeocodingStatus] = useState({})
  const [failedEateries, setFailedEateries] = useState([])
  const [selectedEatery, setSelectedEatery] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [users, setUsers] = useState({}) // Store user data by email
  const infoWindowsRef = useRef({})
  
  // Debug: Log when eateries prop changes
  useEffect(() => {
    console.log('🗺️ Map component received eateries:', eateries.length, 'items')
    if (eateries.length > 0) {
      console.log('🍽️ First eatery:', eateries[0])
    }
  }, [eateries])
  
  // Debug: Log when selectedEatery changes
  useEffect(() => {
    console.log('🎯 selectedEatery changed to:', selectedEatery)
  }, [selectedEatery])
  
  // Function to close all info windows
  const closeAllInfoWindows = useCallback(() => {
    Object.values(infoWindowsRef.current).forEach(iw => iw.close())
  }, [])
  
  // Function to group eateries by address
  const groupEateriesByAddress = useCallback(() => {
    const grouped = {}
    eateries.forEach(eatery => {
      if (eatery.address) {
        const normalizedAddress = eatery.address.toLowerCase().trim()
        if (!grouped[normalizedAddress]) {
          grouped[normalizedAddress] = []
        }
        grouped[normalizedAddress].push(eatery)
      }
    })
    return grouped
  }, [eateries])
  
  // Function to get eateries for a specific address
  const getEateriesForAddress = useCallback((address) => {
    const normalizedAddress = address.toLowerCase().trim()
    return groupEateriesByAddress()[normalizedAddress] || []
  }, [groupEateriesByAddress])

  // Function to fetch user data and get avatar color
  const getUserAvatarColor = useCallback(async (userEmail) => {
    if (users[userEmail]) {
      return users[userEmail].avatarColor
    }
    
    try {
      const response = await fetch('http://localhost:9000/api/users/get-all-users')
      const allUsers = await response.json()
      
      // Find the user by email
      const user = allUsers.users.find(u => u.email === userEmail)

      if (user) {
        // Cache the user data
        setUsers(prev => ({ ...prev, [userEmail]: user }))
        return user.avatarColor
      }
      
      return '#382c5c' // fallback to brand color
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      return '#382c5c' // fallback to brand color
    }
  }, [users])

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
          
          // Add map click listener to close info windows
          mapInstanceRef.current.addListener('click', () => {
            closeAllInfoWindows()
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
          
          // Group eateries by address first
          const groupedEateries = groupEateriesByAddress()
          const uniqueAddresses = Object.keys(groupedEateries)
          
          console.log('🗺️ Found unique addresses:', uniqueAddresses.length)
          
          // Process each unique address
          uniqueAddresses.forEach((address, index) => {
            const eateriesAtAddress = groupedEateries[address]
            const primaryEatery = eateriesAtAddress[0] // Use first eatery for geocoding
            
            console.log(`📍 Geocoding address: ${address} (${eateriesAtAddress.length} eateries)`)
            setGeocodingStatus(prev => ({ ...prev, [address]: 'processing' }))
            
            // Try to geocode the address
            geocoder.geocode({ address: address }, (results, status) => {
              console.log(`📍 Address "${address}" geocoding result:`, { status, results: results?.length || 0 })
              
              if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location
                const position = { lat: location.lat(), lng: location.lng() }
                
                console.log(`✅ Address "${address}" geocoded successfully to:`, position)
                setGeocodingStatus(prev => ({ ...prev, [address]: 'success' }))
                
                // Create custom marker icon with SentrEats logo and user avatar color
                const firstEatery = eateriesAtAddress[0]
                const userEmail = firstEatery.createdBy || firstEatery.email
                
                console.log(`🎨 Creating marker for ${address}:`, {
                  userEmail: userEmail,
                  eateryCount: eateriesAtAddress.length
                })
                
                // Create a canvas-based marker with the actual sentry-glyph.png
                const createMarkerIcon = async (avatarColor) => {
                  return new Promise((resolve) => {
                    const canvas = document.createElement('canvas')
                    canvas.width = 40
                    canvas.height = 40
                    const ctx = canvas.getContext('2d')
                    
                    // Draw background circle with user's avatar color
                    ctx.beginPath()
                    ctx.arc(20, 20, 18, 0, 2 * Math.PI)
                    ctx.fillStyle = avatarColor
                    ctx.fill()
                    ctx.strokeStyle = 'white'
                    ctx.lineWidth = 2
                    ctx.stroke()
                    
                    // Load and draw the actual sentry-glyph.png
                    const img = new Image()
                    img.onload = () => {
                      console.log(`🎨 Logo loaded for ${address}, drawing on ${avatarColor} background`)
                      
                      // Draw logo in white in the center
                      const logoSize = 20
                      const logoX = 20 - logoSize/2
                      const logoY = 20 - logoSize/2
                      ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
                      
                      // Create marker icon from canvas
                      const markerIcon = {
                        url: canvas.toDataURL(),
                        scaledSize: new window.google.maps.Size(40, 40),
                        anchor: new window.google.maps.Point(20, 20)
                      }
                      resolve(markerIcon)
                    }
                    
                    img.onerror = () => {
                      console.error(`❌ Failed to load sentry-glyph.png for ${address}`)
                      // Fallback to just the colored circle
                      resolve(markerIcon)
                    }
                    
                    console.log(`🔄 Loading sentry-glyph.png for ${address} with ${avatarColor} background`)
                    img.src = '/sentry-glyph.png'
                  })
                }
                
                // Create InfoWindow content showing all eateries at this address
                const eateriesList = eateriesAtAddress.map(e => {
                  const potatoes = '🥔'.repeat(e.rating)
                  return `<div style="border-bottom: 1px solid #eee; padding: 8px 0;">
                    <div style="font-weight: bold; color: #382c5c;">${e.name}</div>
                    <div style="font-size: 12px; color: #666;">
                      ${e.type} • ${e.cuisine} • ${e.price} • ${potatoes} ${e.rating}/5
                    </div>
                    <div style="font-size: 11px; color: #888; margin-top: 2px;">
                      by ${e.createdBy || 'Unknown User'}
                    </div>
                  </div>`
                }).join('')
                
                const infoWindowContent = `
                  <div style="min-width: 250px; padding: 10px;">
                    <h3 style="margin: 0 0 8px 0; color: #382c5c; font-size: 16px; font-weight: bold;">
                      📍 ${address}
                    </h3>
                    <div style="margin-bottom: 8px; color: #666; font-size: 12px;">
                      ${eateriesAtAddress.length} eatery${eateriesAtAddress.length > 1 ? 'ies' : ''} at this location
                    </div>
                    ${eateriesList}
                  </div>
                `
                
                // Create InfoWindow
                const infoWindow = new window.google.maps.InfoWindow({
                  content: infoWindowContent,
                  maxWidth: 300
                })
                
                // Store InfoWindow reference in ref using address as key
                infoWindowsRef.current[address] = infoWindow
                
                // Create marker with initial icon (will be updated with proper color)
                const marker = new window.google.maps.Marker({
                  position: position,
                  map: mapInstanceRef.current,
                  title: `${address} (${eateriesAtAddress.length} eateries)`,
                  animation: window.google.maps.Animation.DROP
                })
                
                // Get user avatar color and create proper marker
                getUserAvatarColor(userEmail).then(avatarColor => {
                  console.log(`🎨 Got avatar color for ${userEmail}: ${avatarColor}`)
                  
                  // Create initial colored circle marker
                  const initialIcon = {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="${avatarColor}" stroke="white" stroke-width="2"/>
                        <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🍽️</text>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(40, 40),
                    anchor: new window.google.maps.Point(20, 20)
                  }
                  
                  // Set initial icon
                  marker.setIcon(initialIcon)
                  
                  // Update marker with sentry-glyph.png once loaded
                  createMarkerIcon(avatarColor).then(logoIcon => {
                    marker.setIcon(logoIcon)
                  })
                })
                
                // Add click listener to marker
                marker.addListener('click', () => {
                  console.log(`📍 Marker clicked for address: ${address}`)
                  console.log(`🎯 ${eateriesAtAddress.length} eateries at this location`)
                  
                  // Close all other info windows first
                  closeAllInfoWindows()
                  
                  // Open this marker's info window
                  infoWindow.open(mapInstanceRef.current, marker)
                  
                  // Set selected address to show all eateries in panel below
                  setSelectedAddress(address)
                  setSelectedEatery(null) // Clear individual eatery selection
                })
                
                // Center map on first successful address
                if (index === 0) {
                  mapInstanceRef.current.setCenter(position)
                  mapInstanceRef.current.setZoom(14)
                }
                
                console.log(`📍 Marker added for address "${address}" with ${eateriesAtAddress.length} eateries`)
              } else {
                console.log(`❌ Address "${address}" geocoding failed:`, status)
                setGeocodingStatus(prev => ({ ...prev, [address]: 'failed' }))
                
                // Add all eateries at this address to failed list
                eateriesAtAddress.forEach(eatery => {
                  setFailedEateries(prev => [...prev, eatery])
                })
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
      // Close all info windows
      closeAllInfoWindows()
      // Clear info windows ref
      infoWindowsRef.current = {}
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
        
        {/* Debug: Test button */}
        <div className="mt-4">
          <button 
            onClick={() => {
              if (eateries.length > 0) {
                console.log('🧪 Test button clicked, setting selectedEatery to first eatery')
                setSelectedEatery(eateries[0])
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
          >
            🧪 Test: Show First Eatery Details
          </button>
        </div>
      </div>

      {/* Address Details Panel - Shows all eateries at a location */}
      {selectedAddress && (
        <div className="px-6 mt-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-[#181225]">📍 {selectedAddress}</h3>
              <button
                onClick={() => setSelectedAddress(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              {getEateriesForAddress(selectedAddress).length} eatery{getEateriesForAddress(selectedAddress).length > 1 ? 'ies' : ''} at this location
            </p>

            <div className="space-y-4">
              {getEateriesForAddress(selectedAddress).map((eatery, index) => (
                <div key={eatery.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-[#181225]">{eatery.name}</h4>
                    <div className="text-right">
                      <div className="text-[#FDB81B] font-bold text-sm">
                        {'🥔'.repeat(eatery.rating)}
                      </div>
                      <div className="text-xs text-gray-600">{eatery.rating}/5</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-[#382c5c] text-white px-2 py-1 rounded-full text-xs">
                      {eatery.type}
                    </span>
                    <span className="bg-[#FDB81B] text-white px-2 py-1 rounded-full text-xs">
                      {eatery.cuisine}
                    </span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {eatery.price}
                    </span>
                  </div>
                  
                  {eatery.comment && (
                    <p className="text-gray-700 text-sm italic">"{eatery.comment}"</p>
                  )}
                  
                  {eatery.dietaryOptions && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(eatery.dietaryOptions).map(([option, available]) => (
                          available && (
                            <span key={option} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {option.replace(/([A-Z])/g, ' $1').replace('Free', 'free')}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Added by <span className="font-medium text-[#382c5c]">{eatery.createdBy || 'Unknown User'}</span> on {new Date(eatery.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
