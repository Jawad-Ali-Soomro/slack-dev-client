import axios from '../lib/axios'

const completionService = {
  // Mark a task as completed by a user (one-time only)
  markTaskCompleted: async (taskId) => {
    try {
      const response = await axios.post(`/api/completions/tasks/${taskId}`)
      return response.data
    } catch (error) {
      console.error('Error marking task as completed:', error)
      throw error
    }
  },

  // Mark a meeting as completed by a user (one-time only)
  markMeetingCompleted: async (meetingId) => {
    try {
      const response = await axios.post(`/api/completions/meetings/${meetingId}`)
      return response.data
    } catch (error) {
      console.error('Error marking meeting as completed:', error)
      throw error
    }
  },

  // Mark a project milestone as completed by a user (one-time only)
  markProjectMilestoneCompleted: async (projectId, milestoneId) => {
    try {
      const response = await axios.post(`/api/completions/projects/${projectId}/milestones/${milestoneId}`)
      return response.data
    } catch (error) {
      console.error('Error marking project milestone as completed:', error)
      throw error
    }
  },

  // Check if a user has completed a specific task
  isTaskCompleted: async (taskId) => {
    try {
      const response = await axios.get(`/api/completions/tasks/${taskId}/status`)
      return response.data
    } catch (error) {
      console.error('Error checking task completion status:', error)
      throw error
    }
  },

  // Check if a user has completed a specific meeting
  isMeetingCompleted: async (meetingId) => {
    try {
      const response = await axios.get(`/api/completions/meetings/${meetingId}/status`)
      return response.data
    } catch (error) {
      console.error('Error checking meeting completion status:', error)
      throw error
    }
  },

  // Get user's completion statistics
  getCompletionStats: async () => {
    try {
      const response = await axios.get('/api/completions/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching completion stats:', error)
      throw error
    }
  },

  // Get completion history for a user
  getCompletionHistory: async (filters = {}) => {
    try {
      const response = await axios.get('/api/completions/history', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching completion history:', error)
      throw error
    }
  }
}

export default completionService


