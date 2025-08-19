// Example Database Service - Shows how to migrate from localStorage
// This demonstrates the same interface but with database operations

class EateryServiceDatabase {
  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
  }

  // Load all eateries from database
  async getAllEateries() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries`)
      if (!response.ok) {
        throw new Error('Failed to fetch eateries')
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading eateries from database:', error)
      return []
    }
  }

  // Save all eateries to database (batch operation)
  async saveAllEateries(eateries) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eateries)
      })
      if (!response.ok) {
        throw new Error('Failed to save eateries')
      }
      return true
    } catch (error) {
      console.error('Error saving eateries to database:', error)
      return false
    }
  }

  // Add a new eatery
  async addEatery(eatery) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eatery)
      })
      if (!response.ok) {
        throw new Error('Failed to add eatery')
      }
      return await response.json()
    } catch (error) {
      console.error('Error adding eatery to database:', error)
      throw error
    }
  }

  // Update an existing eatery
  async updateEatery(id, updates) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      if (!response.ok) {
        throw new Error('Failed to update eatery')
      }
      return await response.json()
    } catch (error) {
      console.error('Error updating eatery in database:', error)
      throw error
    }
  }

  // Delete an eatery
  async deleteEatery(id) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to delete eatery')
      }
      return true
    } catch (error) {
      console.error('Error deleting eatery from database:', error)
      throw error
    }
  }

  // Get a single eatery by ID
  async getEateryById(id) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries/${id}`)
      if (!response.ok) {
        return null
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting eatery by ID from database:', error)
      return null
    }
  }

  // Search eateries by name or cuisine
  async searchEateries(query) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to search eateries')
      }
      return await response.json()
    } catch (error) {
      console.error('Error searching eateries in database:', error)
      return []
    }
  }

  // Get eateries by type
  async getEateriesByType(type) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries/type/${encodeURIComponent(type)}`)
      if (!response.ok) {
        throw new Error('Failed to get eateries by type')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting eateries by type from database:', error)
      return []
    }
  }

  // Get eateries with specific dietary options
  async getEateriesByDietaryOption(dietaryOption) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries/dietary/${encodeURIComponent(dietaryOption)}`)
      if (!response.ok) {
        throw new Error('Failed to get eateries by dietary option')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting eateries by dietary option from database:', error)
      return []
    }
  }

  // Clear all data (admin function)
  async clearAllData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to clear data')
      }
      return true
    } catch (error) {
      console.error('Error clearing data from database:', error)
      return false
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/eateries/stats`)
      if (!response.ok) {
        throw new Error('Failed to get storage stats')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting storage stats from database:', error)
      return null
    }
  }
}

// Example of how to switch between localStorage and database
export const createEateryService = (useDatabase = false) => {
  if (useDatabase) {
    return new EateryServiceDatabase()
  } else {
    // Import the localStorage service
    const EateryService = require('./eateryService').default
    return new EateryService()
  }
}

export default EateryServiceDatabase
