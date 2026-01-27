import axios from '../lib/axios'

const noteService = {

  getNotes: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.department) queryParams.append('department', filters.department)
      if (filters.subject) queryParams.append('subject', filters.subject)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.limit) queryParams.append('limit', filters.limit)

      const response = await axios.get(`/api/notes?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getNoteById: async (noteId) => {
    try {
      const response = await axios.get(`/api/notes/${noteId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  createNote: async (noteData) => {
    try {
      const formData = new FormData()
      formData.append('title', noteData.title)
      if (noteData.description) formData.append('description', noteData.description)
      formData.append('department', noteData.department)
      formData.append('subject', noteData.subject)
      if (noteData.tags) {
        if (Array.isArray(noteData.tags)) {
          noteData.tags.forEach(tag => formData.append('tags', tag))
        } else {
          formData.append('tags', noteData.tags)
        }
      }
      if (noteData.pdf) {
        formData.append('pdf', noteData.pdf)
      }

      const response = await axios.post('/api/notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateNote: async (noteId, noteData) => {
    try {
      const formData = new FormData()
      if (noteData.title) formData.append('title', noteData.title)
      if (noteData.description !== undefined) formData.append('description', noteData.description)
      if (noteData.department) formData.append('department', noteData.department)
      if (noteData.subject) formData.append('subject', noteData.subject)
      if (noteData.tags) {
        if (Array.isArray(noteData.tags)) {
          noteData.tags.forEach(tag => formData.append('tags', tag))
        } else {
          formData.append('tags', noteData.tags)
        }
      }
      if (noteData.pdf) {
        formData.append('pdf', noteData.pdf)
      }

      const response = await axios.put(`/api/notes/${noteId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  deleteNote: async (noteId) => {
    try {
      const response = await axios.delete(`/api/notes/${noteId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getDepartments: async () => {
    try {
      const response = await axios.get('/api/notes/departments')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  getSubjectsByDepartment: async (department) => {
    try {
      const response = await axios.get(`/api/notes/subjects/${encodeURIComponent(department)}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default noteService

