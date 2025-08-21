// API configuration
export const API_BASE_URL = 'http://localhost:9000'

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  EATERIES: '/api/eateries',
  USERS: '/api/users',
  AUTH: '/api/auth',
  REVIEWS: '/api/reviews'
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`
