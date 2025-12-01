import axiosInstance from '../lib/axios'

export const exploreService = {
  // Get all public projects
  getPublicProjects: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/api/explore/projects', { params: filters })
      return response.data
    } catch (error) {
      console.error('Get public projects error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch public projects')
    }
  },

  // Get single public project
  getPublicProject: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/explore/projects/${id}`)
      return response.data
    } catch (error) {
      console.error('Get public project error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch project')
    }
  },

  // Create public project
  createPublicProject: async (projectData) => {
    try {
      const formData = new FormData()
      formData.append('title', projectData.title)
      formData.append('description', projectData.description)
      formData.append('price', projectData.price)
      formData.append('category', projectData.category)
      if (projectData.tags) {
        if (Array.isArray(projectData.tags)) {
          formData.append('tags', projectData.tags.join(','))
        } else {
          formData.append('tags', projectData.tags)
        }
      }
      
      // Append zip file
      if (projectData.zipFile) {
        formData.append('zipFile', projectData.zipFile)
      }
      
      // Append preview images
      if (projectData.previewImages && projectData.previewImages.length > 0) {
        projectData.previewImages.forEach(image => {
          formData.append('previewImages', image)
        })
      }

      const response = await axiosInstance.post('/api/explore/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Create public project error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create project')
    }
  },

  // Create stripe payment intent
  createPaymentIntent: async (projectId) => {
    try {
      const response = await axiosInstance.post('/api/explore/checkout/payment-intent', { projectId })
      return response.data
    } catch (error) {
      console.error('Create payment intent error:', error)
      throw new Error(error.response?.data?.message || 'Failed to initiate payment')
    }
  },

  // Purchase project after successful payment
  purchaseProject: async ({ projectId, paymentIntentId }) => {
    try {
      const response = await axiosInstance.post('/api/explore/purchase', { projectId, paymentIntentId })
      return response.data
    } catch (error) {
      console.error('Purchase project error:', error)
      throw new Error(error.response?.data?.message || 'Failed to complete project purchase')
    }
  },

  // Get my purchases and created projects
  getMyPurchases: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/api/explore/my-purchases', { params: filters })
      return response.data
    } catch (error) {
      console.error('Get my purchases error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch purchases')
    }
  },

  // Delete created project
  deletePublicProject: async (projectId) => {
    try {
      const response = await axiosInstance.delete(`/api/explore/projects/${projectId}`)
      return response.data
    } catch (error) {
      console.error('Delete project error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete project')
    }
  },

  // Download project
  downloadProject: async (projectId) => {
    try {
      const response = await axiosInstance.get(`/api/explore/download/${projectId}`, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `project-${projectId}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return { success: true }
    } catch (error) {
      console.error('Download project error:', error)
      throw new Error(error.response?.data?.message || 'Failed to download project')
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/api/explore/categories')
      return response.data
    } catch (error) {
      console.error('Get categories error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch categories')
    }
  }
}

