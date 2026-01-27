import axios from '../lib/axios'

const uploadService = {

  uploadSingleImage: async (file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await axios.post('/api/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  uploadMultipleImages: async (files) => {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('images', file)
      })
      
      const response = await axios.post('/api/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteImage: async (filename) => {
    try {
      const response = await axios.delete(`/api/upload/${filename}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getImageUrl: (filename) => {
    return `${axios.defaults.baseURL}/uploads/posts/${filename}`
  }
}

export default uploadService
