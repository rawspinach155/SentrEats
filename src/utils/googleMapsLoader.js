// Shared Google Maps API loader to prevent multiple loads
let isLoading = false
let isLoaded = false
let loadPromise = null

export const loadGoogleMapsAPI = () => {
  // If already loaded, return immediately
  if (isLoaded && window.google && window.google.maps) {
    return Promise.resolve()
  }

  // If already loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise
  }

  // Check if script is already in the DOM
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
  if (existingScript) {
    isLoading = true
    loadPromise = new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => {
        isLoaded = true
        isLoading = false
        resolve()
      })
      existingScript.addEventListener('error', () => {
        isLoading = false
        reject(new Error('Failed to load Google Maps API'))
      })
    })
    return loadPromise
  }

  // Load the API
  isLoading = true
  loadPromise = new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      isLoading = false
      reject(new Error('Google Maps API key is missing'))
      return
    }
    
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      isLoaded = true
      isLoading = false
      resolve()
    }
    
    script.onerror = () => {
      isLoading = false
      reject(new Error('Failed to load Google Maps API'))
    }
    
    document.head.appendChild(script)
  })

  return loadPromise
}

export const isGoogleMapsLoaded = () => {
  return isLoaded && window.google && window.google.maps
}
