import axios from '../lib/axios'

const postService = {

  createPost: async (postData) => {
    try {
      const response = await axios.post('/api/posts', postData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getPosts: async (params = {}) => {
    try {
      const response = await axios.get('/api/posts', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getPost: async (postId) => {
    try {
      const response = await axios.get(`/api/posts/${postId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  toggleLike: async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  toggleBookmark: async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/bookmark`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, { content })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  toggleCommentLike: async (postId, commentId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments/${commentId}/like`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  sharePost: async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/share`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updatePost: async (postId, postData) => {
    try {
      const response = await axios.put(`/api/posts/${postId}`, postData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await axios.delete(`/api/posts/${postId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  togglePin: async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/pin`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getUserPosts: async (userId, params = {}) => {
    try {
      const response = await axios.get(`/api/posts/user/${userId}`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getTrendingPosts: async (params = {}) => {
    try {
      const response = await axios.get('/api/posts/trending', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getPostComments: async (postId, params = {}) => {
    try {
      const response = await axios.get(`/api/posts/${postId}/comments`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateComment: async (postId, commentId, content) => {
    try {
      const response = await axios.put(`/api/posts/${postId}/comments/${commentId}`, { content })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteComment: async (postId, commentId) => {
    try {
      const response = await axios.delete(`/api/posts/${postId}/comments/${commentId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  addReply: async (postId, commentId, content) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments/${commentId}/replies`, { content })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  addCommentReaction: async (postId, commentId, reactionType) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments/${commentId}/reactions`, { reactionType })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default postService

