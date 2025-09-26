import axiosInstance from "../lib/axios";


export const codeCollaborationService = {
  // Create a new code session
  createSession: async (sessionData) => {
    try {
      const response = await axiosInstance.post('/api/code-collaboration', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating code session:', error);
      throw error;
    }
  },

  // Get session by ID
  getSessionById: async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/api/code-collaboration/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting code session:', error);
      throw error;
    }
  },

  // Get user's sessions
  getUserSessions: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(`/api/code-collaboration/user/sessions?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  },

  // Get public sessions
  getPublicSessions: async (page = 1, limit = 10, language = null) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (language) params.append('language', language);
      
      const response = await axiosInstance.get(`/api/code-collaboration/public/sessions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error getting public sessions:', error);
      throw error;
    }
  },

  // Join a session
  joinSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/api/code-collaboration/${sessionId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  },

  // Leave a session
  leaveSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/api/code-collaboration/${sessionId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Error leaving session:', error);
      throw error;
    }
  },

  // Update code
  updateCode: async (sessionId, code, cursorPosition = null) => {
    try {
      const response = await axiosInstance.put(`/api/code-collaboration/${sessionId}/code`, {
        code,
        cursorPosition
      });
      return response.data;
    } catch (error) {
      console.error('Error updating code:', error);
      throw error;
    }
  },

  // Update cursor position
  updateCursor: async (sessionId, cursorPosition) => {
    try {
      const response = await axiosInstance.put(`/api/code-collaboration/${sessionId}/cursor`, {
        cursorPosition
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cursor:', error);
      throw error;
    }
  },

  // Get session stats
  getSessionStats: async () => {
    try {
      const response = await axiosInstance.get('/api/code-collaboration/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error getting session stats:', error);
      throw error;
    }
  },

  // End a session
  endSession: async (sessionId) => {
    try {
      const response = await axiosInstance.put(`/api/code-collaboration/${sessionId}/end`);
      return response.data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },

  // Delete a session permanently
  deleteSession: async (sessionId) => {
    try {
      const response = await axiosInstance.delete(`/api/code-collaboration/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // Generate invite code
  generateInviteCode: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/api/code-collaboration/${sessionId}/invite-code`);
      return response.data;
    } catch (error) {
      console.error('Error generating invite code:', error);
      throw error;
    }
  },

  // Join session by invite code
  joinByInviteCode: async (inviteCode) => {
    try {
      const response = await axiosInstance.post(`/api/code-collaboration/join/${inviteCode}`);
      return response.data;
    } catch (error) {
      console.error('Error joining by invite code:', error);
      throw error;
    }
  },

  // Get session by invite code (for preview)
  getSessionByInviteCode: async (inviteCode) => {
    try {
      const response = await axiosInstance.get(`/api/code-collaboration/join/${inviteCode}`);
      return response.data;
    } catch (error) {
      console.error('Error getting session by invite code:', error);
      throw error;
    }
  },

  // Invite user to session
  inviteUser: async (sessionId, invitedUserId) => {
    try {
      const response = await axiosInstance.post(`/api/code-collaboration/${sessionId}/invite`, {
        invitedUserId
      });
      return response.data;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  }
};
