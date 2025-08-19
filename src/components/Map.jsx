import React, { useEffect, useRef, useState } from 'react'

const Map = () => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initMap
      script.onerror = () => {
        setError('Failed to load Google Maps')
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

          // Add a marker for the default location
          new window.google.maps.Marker({
            position: defaultLocation,
            map: mapInstanceRef.current,
            title: 'Default Location'
          })

          setIsLoading(false)
        }
      } catch (err) {
        setError('Failed to initialize map')
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
    </div>
  )
}

export default Map
