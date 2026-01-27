import axios from '../lib/axios'

const challengeService = {

  getChallenges: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty)
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.limit) queryParams.append('limit', filters.limit)

      const response = await axios.get(`/api/challenges?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getChallengeById: async (challengeId) => {
    try {
      const response = await axios.get(`/api/challenges/${challengeId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  createChallenge: async (challengeData) => {
    try {
      const response = await axios.post('/api/challenges', challengeData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateChallenge: async (challengeId, challengeData) => {
    try {
      const response = await axios.put(`/api/challenges/${challengeId}`, challengeData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteChallenge: async (challengeId) => {
    try {
      const response = await axios.delete(`/api/challenges/${challengeId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  submitSolution: async (challengeId, solution, answer) => {
    try {
      const response = await axios.post(`/api/challenges/${challengeId}/submit`, { 
        solution,
        answer: answer || ''
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getMyChallenges: async () => {
    try {
      const response = await axios.get('/api/challenges/my-challenges')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getCategories: async () => {
    try {
      const response = await axios.get('/api/challenges/categories')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default challengeService


