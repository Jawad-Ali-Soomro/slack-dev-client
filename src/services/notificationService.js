import axios from '../lib/axios'

const notificationService = {
  // Get all notifications for the current user
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

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    try {
      const response = await axios.get(`/api/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.put(`/api/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await axios.put('/api/notifications/read-all')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await axios.delete(`/api/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      const response = await axios.delete('/api/notifications')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get notification statistics
  getNotificationStats: async () => {
    try {
      const response = await axios.get('/api/notifications/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Create notification (for testing or admin use)
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
