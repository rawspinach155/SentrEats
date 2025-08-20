import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Check authentication status on mount and when localStorage changes
  const checkAuthStatus = async () => {
    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName')
    const userAvatarColor = localStorage.getItem('userAvatarColor')
    const userId = localStorage.getItem('userId')
    
    if (userEmail && userName && userId) {
      // First, set the user from localStorage for immediate display
      const user = { 
        id: parseInt(userId),
        email: userEmail, 
        name: userName,
        avatarColor: userAvatarColor 
      }
      setIsAuthenticated(true)
      setCurrentUser(user)
      
      // Then fetch the latest user data from the backend to ensure we have the most up-to-date info
      try {
        const response = await fetch(`http://localhost:9000/api/users/get-all-users`)
        if (response.ok) {
          const data = await response.json()
          const latestUser = data.users.find(u => u.id === parseInt(userId))
          
          if (latestUser) {
            // Update localStorage with the latest data
            localStorage.setItem('userEmail', latestUser.email)
            localStorage.setItem('userName', latestUser.name)
            localStorage.setItem('userAvatarColor', latestUser.avatarColor)
            
            // Update the current user state with the latest data
            const updatedUser = {
              id: latestUser.id,
              email: latestUser.email,
              name: latestUser.name,
              avatarColor: latestUser.avatarColor
            }
            setCurrentUser(updatedUser)
            
            console.log('useAuth: Updated user data from backend:', updatedUser)
          }
        }
      } catch (error) {
        console.log('useAuth: Could not fetch latest user data from backend, using localStorage data')
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
    localStorage.setItem('userEmail', userData.email)
    localStorage.setItem('userName', userData.name)
    localStorage.setItem('userId', userData.id.toString())
    if (userData.avatarColor) {
      localStorage.setItem('userAvatarColor', userData.avatarColor)
    }
    
    // Update state immediately
    setIsAuthenticated(true)
    setCurrentUser(userData)
    
    // Force a re-check of auth status to ensure state is properly updated
    setTimeout(() => {
      console.log('useAuth: Forcing auth status check after login...')
      checkAuthStatus()
    }, 100)
    
    console.log('useAuth: State updated - isAuthenticated: true, currentUser:', userData)
  }

  const logout = () => {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    localStorage.removeItem('userAvatarColor')
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  const signup = (userData) => {
    console.log('Signing up user:', userData)
    localStorage.setItem('userEmail', userData.email)
    localStorage.setItem('userName', userData.name)
    localStorage.setItem('userId', userData.id)
    if (userData.avatarColor) {
      localStorage.setItem('userAvatarColor', userData.avatarColor)
    }
    setIsAuthenticated(true)
    setCurrentUser(userData)
    console.log('User signed up successfully')
  }

  const updateProfile = (updatedUserData) => {
    localStorage.setItem('userEmail', updatedUserData.email)
    localStorage.setItem('userName', updatedUserData.name)
    if (updatedUserData.id) {
      localStorage.setItem('userId', updatedUserData.id)
    }
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
