// Eatery Service - Abstracts data storage operations
// This makes it easy to migrate from localStorage to a database later

class EateryService {
  constructor() {
    this.storageKey = 'sentre-eats-eateries'
  }

  // Load all eateries from storage
  async getAllEateries() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading eateries:', error)
      return []
    }
  }

  // Save all eateries to storage
  async saveAllEateries(eateries) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(eateries))
      return true
    } catch (error) {
      console.error('Error saving eateries:', error)
      return false
    }
  }

  // Add a new eatery
  async addEatery(eatery) {
    try {
      const eateries = await this.getAllEateries()
      const newEatery = {
        ...eatery,
        id: Date.now().toString(), // Simple ID generation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const updatedEateries = [...eateries, newEatery]
      await this.saveAllEateries(updatedEateries)
      
      return newEatery
    } catch (error) {
      console.error('Error adding eatery:', error)
      throw error
    }
  }

  // Update an existing eatery
  async updateEatery(id, updates) {
    try {
      const eateries = await this.getAllEateries()
      const index = eateries.findIndex(eatery => eatery.id === id)
      
      if (index === -1) {
        throw new Error('Eatery not found')
      }
      
      const updatedEatery = {
        ...eateries[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      eateries[index] = updatedEatery
      await this.saveAllEateries(eateries)
      
      return updatedEatery
    } catch (error) {
      console.error('Error updating eatery:', error)
      throw error
    }
  }

  // Delete an eatery
  async deleteEatery(id) {
    try {
      const eateries = await this.getAllEateries()
      const filteredEateries = eateries.filter(eatery => eatery.id !== id)
      await this.saveAllEateries(filteredEateries)
      
      return true
    } catch (error) {
      console.error('Error deleting eatery:', error)
      throw error
    }
  }

  // Get a single eatery by ID
  async getEateryById(id) {
    try {
      const eateries = await this.getAllEateries()
      return eateries.find(eatery => eatery.id === id) || null
    } catch (error) {
      console.error('Error getting eatery by ID:', error)
      return null
    }
  }

  // Search eateries by name or cuisine
  async searchEateries(query) {
    try {
      const eateries = await this.getAllEateries()
      const lowercaseQuery = query.toLowerCase()
      
      return eateries.filter(eatery => 
        eatery.name.toLowerCase().includes(lowercaseQuery) ||
        eatery.cuisine.toLowerCase().includes(lowercaseQuery) ||
        eatery.address.toLowerCase().includes(lowercaseQuery)
      )
    } catch (error) {
      console.error('Error searching eateries:', error)
      return []
    }
  }

  // Get eateries by type
  async getEateriesByType(type) {
    try {
      const eateries = await this.getAllEateries()
      return eateries.filter(eatery => eatery.type === type)
    } catch (error) {
      console.error('Error getting eateries by type:', error)
      return []
    }
  }

  // Get eateries with specific dietary options
  async getEateriesByDietaryOption(dietaryOption) {
    try {
      const eateries = await this.getAllEateries()
      return eateries.filter(eatery => 
        eatery.dietaryOptions && eatery.dietaryOptions[dietaryOption]
      )
    } catch (error) {
      console.error('Error getting eateries by dietary option:', error)
      return []
    }
  }

  // Clear all data (useful for testing or reset)
  async clearAllData() {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('Error clearing data:', error)
      return false
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const eateries = await this.getAllEateries()
      const totalSize = JSON.stringify(eateries).length
      
      return {
        totalEateries: eateries.length,
        storageSize: totalSize,
        storageSizeKB: (totalSize / 1024).toFixed(2),
        lastUpdated: eateries.length > 0 
          ? new Date(Math.max(...eateries.map(e => new Date(e.updatedAt))))
          : null
      }
    } catch (error) {
      console.error('Error getting storage stats:', error)
      return null
    }
  }
}

// Create and export a singleton instance
const eateryService = new EateryService()
export default eateryService
