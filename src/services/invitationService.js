import axios from '../lib/axios'

const invitationService = {
  sendInvitation: async ({ targetType, targetId, inviteeId, role = 'member' }) => {
    try {
      const response = await axios.post('/api/invitations', {
        targetType,
        targetId,
        inviteeId,
        role,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getInvitations: async (type = 'received', status) => {
    try {
      const params = new URLSearchParams({ type })
      if (status) params.append('status', status)
      const response = await axios.get(`/api/invitations?${params.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  respondToInvitation: async (invitationId, action) => {
    try {
      const response = await axios.post('/api/invitations/respond', {
        invitationId,
        action,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  cancelInvitation: async (invitationId) => {
    try {
      const response = await axios.delete(`/api/invitations/${invitationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default invitationService
