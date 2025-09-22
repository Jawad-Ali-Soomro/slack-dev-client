import axios from '../lib/axios'

const profileService = {
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put('/api/user/profile', profileData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Upload avatar
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

  // Delete avatar
  deleteAvatar: async () => {
    try {
      const response = await axios.delete('/api/user/avatar')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Change password
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
