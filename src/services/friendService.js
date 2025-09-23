import axios from '../lib/axios'

const friendService = {
  // Send friend request
  sendFriendRequest: async (receiverId) => {
    try {
      const response = await axios.post('/api/friends/request', { receiverId })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get friend requests
  getFriendRequests: async (type = 'all') => {
    try {
      const response = await axios.get(`/api/friends/requests?type=${type}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Respond to friend request
  respondToFriendRequest: async (requestId, action) => {
    try {
      const response = await axios.post('/api/friends/respond', { requestId, action })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get friends list
  getFriends: async () => {
    try {
      const response = await axios.get('/api/friends')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Remove friend
  removeFriend: async (friendId) => {
    try {
      const response = await axios.delete(`/api/friends/${friendId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get friend stats
  getFriendStats: async () => {
    try {
      const response = await axios.get('/api/friends/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Search users for friend requests
  searchUsersForFriends: async (search = '', limit = 20) => {
    try {
      const response = await axios.get(`/api/friends/search?search=${search}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default friendService

