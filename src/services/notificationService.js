import axios from '../lib/axios'

const notificationService = {

  getNotifications: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.limit) queryParams.append('limit', filters.limit)

      const response = await axios.get(`/api/notifications?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getNotificationById: async (notificationId) => {
    try {
      const response = await axios.get(`/api/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await axios.put(`/api/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await axios.put('/api/notifications/read-all')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await axios.delete(`/api/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteAllNotifications: async () => {
    try {
      const response = await axios.delete('/api/notifications')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getNotificationStats: async () => {
    try {
      const response = await axios.get('/api/notifications/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  createNotification: async (notificationData) => {
    try {
      const response = await axios.post('/api/notifications', notificationData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default notificationService
