import axiosInstance from '../lib/axios'

export const githubService = {
  // Stats
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/api/github/stats')
      return response.data
    } catch (error) {
      console.error('Get GitHub stats error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch GitHub stats')
    }
  },

  // Repository methods
  createRepository: async (repositoryData) => {
    try {
      const response = await axiosInstance.post('/api/github/repositories', repositoryData)
      return response.data
    } catch (error) {
      console.error('Create repository error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create repository')
    }
  },

  getRepositories: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/api/github/repositories', { params: filters })
      return response.data
    } catch (error) {
      console.error('Get repositories error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch repositories')
    }
  },

  getRepository: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/github/repositories/${id}`)
      return response.data
    } catch (error) {
      console.error('Get repository error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch repository')
    }
  },

  updateRepository: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/api/github/repositories/${id}`, updateData)
      return response.data
    } catch (error) {
      console.error('Update repository error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update repository')
    }
  },

  deleteRepository: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/github/repositories/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete repository error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete repository')
    }
  },

  // Pull Request methods
  createPullRequest: async (prData) => {
    try {
      const response = await axiosInstance.post('/api/github/pull-requests', prData)
      return response.data
    } catch (error) {
      console.error('Create pull request error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create pull request')
    }
  },

  getPullRequests: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/api/github/pull-requests', { params: filters })
      return response.data
    } catch (error) {
      console.error('Get pull requests error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch pull requests')
    }
  },

  updatePullRequest: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/api/github/pull-requests/${id}`, updateData)
      return response.data
    } catch (error) {
      console.error('Update pull request error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update pull request')
    }
  },

  deletePullRequest: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/github/pull-requests/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete pull request error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete pull request')
    }
  },

  // Issue methods
  createIssue: async (issueData) => {
    try {
      const response = await axiosInstance.post('/api/github/issues', issueData)
      return response.data
    } catch (error) {
      console.error('Create issue error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create issue')
    }
  },

  getIssues: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/api/github/issues', { params: filters })
      return response.data
    } catch (error) {
      console.error('Get issues error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch issues')
    }
  },

  updateIssue: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/api/github/issues/${id}`, updateData)
      return response.data
    } catch (error) {
      console.error('Update issue error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update issue')
    }
  },

  deleteIssue: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/github/issues/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete issue error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete issue')
    }
  },

  // Friends methods
  getFriends: async () => {
    try {
      const response = await axiosInstance.get('/api/github/friends')
      return response.data
    } catch (error) {
      console.error('Get friends error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch friends')
    }
  }
}
