import axios from '../lib/axios'

const taskService = {
  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await axios.post('/api/tasks', taskData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get all tasks with optional filters
  getTasks: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.priority) queryParams.append('priority', filters.priority)
      if (filters.assignTo) queryParams.append('assignTo', filters.assignTo)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.limit) queryParams.append('limit', filters.limit)

      const response = await axios.get(`/api/tasks?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get task by ID
  getTaskById: async (taskId) => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update task
  updateTask: async (taskId, updateData) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, updateData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update task status (assigned user only)
  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}/status`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Reassign task
  reassignTask: async (taskId, assignTo) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}/reassign`, { assignTo })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      const response = await axios.delete(`/api/tasks/${taskId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get task statistics
  getTaskStats: async (assignTo = null) => {
    try {
      const queryParams = assignTo ? `?assignTo=${assignTo}` : ''
      const response = await axios.get(`/api/tasks/stats${queryParams}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default taskService
