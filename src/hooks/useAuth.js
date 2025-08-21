import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Check authentication status on mount and when localStorage changes
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        
        // Set user from localStorage for immediate display
        setIsAuthenticated(true)
        setCurrentUser(user)
        
        // Verify token with backend
        try {
          const response = await fetch('https://3d0b9d215ce7.ngrok-free.app/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            // Update with latest user data from backend
            setCurrentUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
          } else {
            // Token is invalid, clear auth
            logout()
          }
        } catch (error) {
          console.log('useAuth: Could not verify token with backend, using localStorage data')
        }
      } catch (error) {
        console.error('useAuth: Error parsing user data:', error)
        logout()
      }
    } else {
      setIsAuthenticated(false)
      setCurrentUser(null)
    }
  }

  useEffect(() => {
    checkAuthStatus()
    
    // Listen for storage changes (in case localStorage is modified from another tab)
    window.addEventListener('storage', checkAuthStatus)
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus)
    }
  }, [])



  const login = (userData) => {
    console.log('useAuth: login() called with userData:', userData)
    
    // Store in localStorage
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData.user))
    
    // Update state immediately
    setIsAuthenticated(true)
    setCurrentUser(userData.user)
    
    console.log('useAuth: State updated - isAuthenticated: true, currentUser:', userData.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  const signup = (userData) => {
    console.log('Signing up user:', userData)
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData.user))
    setIsAuthenticated(true)
    setCurrentUser(userData.user)
    console.log('User signed up successfully')
  }

  const updateProfile = (updatedUserData) => {
    const currentUserData = JSON.parse(localStorage.getItem('user') || '{}')
    const updatedUser = { ...currentUserData, ...updatedUserData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }

  return {
    isAuthenticated,
    currentUser,
    login,
    logout,
    signup,
    updateProfile,
    checkAuthStatus
  }
}
