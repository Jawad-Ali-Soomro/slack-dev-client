import axios from '../lib/axios'

const enhancedTaskService = {

  createTask: async (taskData) => {
    try {
      const response = await axios.post('/api/tasks', taskData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getTasks: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()

      if (filters.status) queryParams.append('status', filters.status)
      if (filters.priority) queryParams.append('priority', filters.priority)
      if (filters.assignTo) queryParams.append('assignTo', filters.assignTo)
      if (filters.assignedBy) queryParams.append('assignedBy', filters.assignedBy)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.limit) queryParams.append('limit', filters.limit)

      const response = await axios.get(`/api/tasks?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getTaskById: async (taskId) => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateTask: async (taskId, updateData) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, updateData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}/status`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  reassignTask: async (taskId, assignTo) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}/reassign`, { assignTo })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await axios.delete(`/api/tasks/${taskId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getTaskStats: async () => {
    try {
      const response = await axios.get('/api/tasks/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  clearTaskCaches: async () => {
    try {
      const response = await axios.post('/api/tasks/clear-cache')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default enhancedTaskService
