import axios from '../lib/axios'

const projectService = {

  getProjects: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.priority) queryParams.append('priority', filters.priority)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.limit) queryParams.append('limit', filters.limit)

      const response = await axios.get(`/api/projects?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getProjectById: async (projectId) => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await axios.post('/api/projects', projectData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateProject: async (projectId, projectData) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, projectData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteProject: async (projectId) => {
    try {
      const response = await axios.delete(`/api/projects/${projectId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getProjectStats: async () => {
    try {
      const response = await axios.get('/api/projects/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  addMember: async (projectId, memberData) => {
    try {
      const response = await axios.post(`/api/projects/${projectId}/members`, memberData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  removeMember: async (projectId, memberData) => {
    try {
      const response = await axios.delete(`/api/projects/${projectId}/members`, { data: memberData })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateMemberRole: async (projectId, roleData) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}/members/role`, roleData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  addLink: async (projectId, linkData) => {
    try {
      const response = await axios.post(`/api/projects/${projectId}/links`, linkData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateLink: async (projectId, linkData) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}/links`, linkData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  removeLink: async (projectId, linkData) => {
    try {
      const response = await axios.delete(`/api/projects/${projectId}/links`, { data: linkData })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default projectService
