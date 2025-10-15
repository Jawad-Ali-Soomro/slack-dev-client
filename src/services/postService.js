import axios from '../lib/axios'

const postService = {
  // Create a new post
  createPost: async (postData) => {
    try {
      const response = await axios.post('/api/posts', postData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get posts with pagination and filtering
  getPosts: async (params = {}) => {
    try {
      const response = await axios.get('/api/posts', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get a single post
  getPost: async (postId) => {
    try {
      const response = await axios.get(`/api/posts/${postId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Like/Unlike a post
  toggleLike: async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Bookmark/Unbookmark a post
  toggleBookmark: async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/bookmark`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Add comment to a post
  addComment: async (postId, content) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, { content })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Like/Unlike a comment
  toggleCommentLike: async (postId, commentId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments/${commentId}/like`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Share a post
  sharePost: async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/share`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update a post
  updatePost: async (postId, postData) => {
    try {
      const response = await axios.put(`/api/posts/${postId}`, postData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete a post
  deletePost: async (postId) => {
    try {
      const response = await axios.delete(`/api/posts/${postId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Pin/Unpin a post
  togglePin: async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/pin`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get user's posts
  getUserPosts: async (userId, params = {}) => {
    try {
      const response = await axios.get(`/api/posts/user/${userId}`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get trending posts
  getTrendingPosts: async (params = {}) => {
    try {
      const response = await axios.get('/api/posts/trending', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get post comments with pagination
  getPostComments: async (postId, params = {}) => {
    try {
      const response = await axios.get(`/api/posts/${postId}/comments`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update a comment
  updateComment: async (postId, commentId, content) => {
    try {
      const response = await axios.put(`/api/posts/${postId}/comments/${commentId}`, { content })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete a comment
  deleteComment: async (postId, commentId) => {
    try {
      const response = await axios.delete(`/api/posts/${postId}/comments/${commentId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Add a reply to a comment
  addReply: async (postId, commentId, content) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments/${commentId}/replies`, { content })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Add reaction to a comment
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

