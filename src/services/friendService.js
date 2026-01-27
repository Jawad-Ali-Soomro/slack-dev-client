import axios from '../lib/axios'

const friendService = {

  sendFriendRequest: async (receiverId) => {
    try {
      const response = await axios.post('/api/friends/request', { receiverId })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getFriendRequests: async (type = 'all') => {
    try {
      const response = await axios.get(`/api/friends/requests?type=${type}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  respondToFriendRequest: async (requestId, action) => {
    try {
      const response = await axios.post('/api/friends/respond', { requestId, action })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getFriends: async () => {
    try {
      const response = await axios.get('/api/friends')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  removeFriend: async (friendId) => {
    try {
      const response = await axios.delete(`/api/friends/${friendId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getFriendStats: async () => {
    try {
      const response = await axios.get('/api/friends/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

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

