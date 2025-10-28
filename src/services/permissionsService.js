import axiosInstance from "../lib/axios";

const permissionsService = {
  // Get all users with their permissions (Admin only)
  getAllUsersWithPermissions: async () => {
    try {
      const response = await axiosInstance.get('/api/permissions/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users with permissions:', error);
      throw error;
    }
  },

  // Get permissions for a specific user
  getUserPermissions: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/permissions/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },

  // Create or update permissions (Admin only)
  createOrUpdatePermissions: async (userId, permissions) => {
    try {
      const response = await axiosInstance.post(`/api/permissions/user/${userId}`, permissions);
      return response.data;
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  },

  // Delete permissions (Admin only)
  deletePermissions: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/api/permissions/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting permissions:', error);
      throw error;
    }
  }
};

export default permissionsService;
