import axios from '../lib/axios'

const profileService = {

  getProfile: async () => {
    try {
      const response = await axios.get('/api/user/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axios.put('/api/user/profile', profileData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await axios.post('/api/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteAvatar: async () => {
    try {
      const response = await axios.delete('/api/user/avatar')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await axios.put('/api/user/change-password', passwordData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default profileService
