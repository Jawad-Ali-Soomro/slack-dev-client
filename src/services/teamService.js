import axios from '../lib/axios'

const teamService = {
  // Get all teams
  getTeams: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.limit) queryParams.append('limit', filters.limit)

      const response = await axios.get(`/api/teams?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get team by ID
  getTeamById: async (teamId) => {
    try {
      const response = await axios.get(`/api/teams/${teamId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Create team
  createTeam: async (teamData) => {
    try {
      const response = await axios.post('/api/teams', teamData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update team
  updateTeam: async (teamId, teamData) => {
    try {
      const response = await axios.put(`/api/teams/${teamId}`, teamData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete team
  deleteTeam: async (teamId) => {
    try {
      const response = await axios.delete(`/api/teams/${teamId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get team statistics
  getTeamStats: async () => {
    try {
      const response = await axios.get('/api/teams/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Add member to team
  addMember: async (teamId, memberData) => {
    try {
      const response = await axios.post(`/api/teams/${teamId}/members`, memberData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Remove member from team
  removeMember: async (teamId, memberData) => {
    try {
      const response = await axios.delete(`/api/teams/${teamId}/members`, { data: memberData })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update member role
  updateMemberRole: async (teamId, roleData) => {
    try {
      const response = await axios.put(`/api/teams/${teamId}/members/role`, roleData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get team members for assignment dropdowns
  getTeamMembers: async (teamId) => {
    try {
      const response = await axios.get(`/api/teams/${teamId}/members`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default teamService
