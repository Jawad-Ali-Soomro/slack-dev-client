import axios from '../lib/axios'

const userService = {
  // Get all users with optional filters
  getUsers: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.limit) queryParams.append('limit', filters.limit)
      if (filters.search) queryParams.append('search', filters.search)

      const response = await axios.get(`/api/users?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Search users
  searchUsers: async (query) => {
    try {
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default userService
