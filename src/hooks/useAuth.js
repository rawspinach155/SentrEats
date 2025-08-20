import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    checkAuthStatus()
    
    // Listen for storage changes (in case localStorage is modified from another tab)
    window.addEventListener('storage', checkAuthStatus)
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus)
    }
  }, [])

  const checkAuthStatus = () => {
    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName')
    const userAvatarColor = localStorage.getItem('userAvatarColor')
    
    if (userEmail && userName) {
      setIsAuthenticated(true)
      setCurrentUser({ 
        email: userEmail, 
        name: userName,
        avatarColor: userAvatarColor 
      })
    } else {
      setIsAuthenticated(false)
      setCurrentUser(null)
    }
  }

  const login = (userData) => {
    localStorage.setItem('userEmail', userData.email)
    localStorage.setItem('userName', userData.name)
    if (userData.avatarColor) {
      localStorage.setItem('userAvatarColor', userData.avatarColor)
    }
    setIsAuthenticated(true)
    setCurrentUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  const signup = (userData) => {
    localStorage.setItem('userEmail', userData.email)
    localStorage.setItem('userName', userData.name)
    setIsAuthenticated(true)
    setCurrentUser(userData)
  }

  const updateProfile = (updatedUserData) => {
    localStorage.setItem('userEmail', updatedUserData.email)
    localStorage.setItem('userName', updatedUserData.name)
    if (updatedUserData.avatarColor) {
      localStorage.setItem('userAvatarColor', updatedUserData.avatarColor)
    }
    setCurrentUser(updatedUserData)
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
