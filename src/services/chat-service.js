import axiosInstance from "../lib/axios";

const API_BASE = "/api/chat";

export const chatService = {
  createChat: async (chatData) => {
    const response = await axiosInstance.post(`${API_BASE}`, chatData);
    return response.data;
  },

  uploadGroupLogo: async (file) => {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await axiosInstance.post(`${API_BASE}/groups/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return response.data;
  },

  updateGroup: async (chatId, updates) => {
    const response = await axiosInstance.put(`${API_BASE}/${chatId}`, updates);
    return response.data;
  },

  removeGroupMember: async (chatId, memberId) => {
    const response = await axiosInstance.delete(
      `${API_BASE}/${chatId}/members/${memberId}`,
    );
    return response.data;
  },

  getUserChats: async (page = 1, limit = 20) => {
    const response = await axiosInstance.get(
      `${API_BASE}?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getChatMessages: async (chatId, page = 1, limit = 50) => {
    const response = await axiosInstance.get(`${API_BASE}/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await axiosInstance.post(
      `${API_BASE}/messages`,
      messageData,
    );
    return response.data;
  },

  updateMessage: async (messageId, updateData) => {
    const response = await axiosInstance.put(
      `${API_BASE}/messages/${messageId}`,
      updateData,
    );
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await axiosInstance.delete(
      `${API_BASE}/messages/${messageId}`,
    );
    return response.data;
  },

  markAsRead: async (chatId) => {
    const response = await axiosInstance.put(`${API_BASE}/${chatId}/read`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get(`${API_BASE}/unread/count`);
    return response.data;
  },
};
