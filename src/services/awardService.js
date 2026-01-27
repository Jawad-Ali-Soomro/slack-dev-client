import axios from '../lib/axios'

const awardService = {

  getMyAwards: async () => {
    try {
      const response = await axios.get('/api/awards/my-awards')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getAllAwards: async () => {
    try {
      const response = await axios.get('/api/awards/all')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default awardService

