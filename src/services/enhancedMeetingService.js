import axios from '../lib/axios'

const enhancedMeetingService = {

  createMeeting: async (meetingData) => {
    try {
      const response = await axios.post('/api/meetings', meetingData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getMeetings: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()

      if (filters.status) queryParams.append('status', filters.status)
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo)
      if (filters.assignedBy) queryParams.append('assignedBy', filters.assignedBy)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.limit) queryParams.append('limit', filters.limit)

      const response = await axios.get(`/api/meetings?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getMeetingById: async (meetingId) => {
    try {
      const response = await axios.get(`/api/meetings/${meetingId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateMeeting: async (meetingId, updateData) => {
    try {
      const response = await axios.put(`/api/meetings/${meetingId}`, updateData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateMeetingStatus: async (meetingId, status) => {
    try {
      const response = await axios.put(`/api/meetings/${meetingId}/status`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  rescheduleMeeting: async (meetingId, rescheduleData) => {
    try {
      const response = await axios.put(`/api/meetings/${meetingId}/reschedule`, rescheduleData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  reassignMeeting: async (meetingId, assignedTo) => {
    try {
      const response = await axios.put(`/api/meetings/${meetingId}/reassign`, { assignedTo })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateAttendees: async (meetingId, attendees) => {
    try {
      const response = await axios.put(`/api/meetings/${meetingId}/attendees`, { attendees })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteMeeting: async (meetingId) => {
    try {
      const response = await axios.delete(`/api/meetings/${meetingId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getMeetingStats: async () => {
    try {
      const response = await axios.get('/api/meetings/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default enhancedMeetingService
