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
  },

  getAllUsers: async (page = 1, limit = 20, search = '', role = '') => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    const response = await axiosInstance.get(`${API_BASE}/admin/users?${params.toString()}`);
    return response.data;
  },

  assignUserRole: async (userId, role) => {
    const response = await axiosInstance.put(`${API_BASE}/admin/${userId}/role`, { role });
    return response.data;
  },

  updateUserVerification: async (userId, emailVerified) => {
    const response = await axiosInstance.put(`${API_BASE}/admin/${userId}/verification`, { emailVerified });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`${API_BASE}/admin/${userId}`);
    return response.data;
  }
};