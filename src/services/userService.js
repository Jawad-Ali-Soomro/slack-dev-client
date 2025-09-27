import axiosInstance from "../lib/axios";


const API_BASE = '/api/user';

export const userService = {
  getUsers: async (page = 1, limit = 20) => {
    const response = await axiosInstance.get(`${API_BASE}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await axiosInstance.get(`${API_BASE}/${userId}`);
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await axiosInstance.get(`${API_BASE}/${userId}/details`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await axiosInstance.get(`${API_BASE}/search?q=${query}`);
    return response.data;
  }
};