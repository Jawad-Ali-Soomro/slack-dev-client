import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Crown,
  Mail,
  Calendar,
  Eye,
  Plus,
  UserPlus,
  X
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import HorizontalLoader from '../../components/HorizontalLoader';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { getAvatarProps } from '../../utils/avatarUtils';
import { PiUserDuotone, PiUsersDuotone } from 'react-icons/pi';
import UserDetailsModal from '../../components/UserDetailsModal';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';

const UserManagement = () => {
  const { user, isSuperadmin, isAdmin } = useAuth();
  const isTeamScopedAdmin = isAdmin && !isSuperadmin;
  const canAssignRoles = isSuperadmin;
  const canUpdateVerification = isAdmin;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [permissionsFilter, setPermissionsFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [newRole, setNewRole] = useState('user');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedUserForVerification, setSelectedUserForVerification] = useState(null);
  const [newVerificationValue, setNewVerificationValue] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  
  // Create user form state
  const [createUserForm, setCreateUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Check if user is admin or superadmin
  useEffect(() => {
    if (!isAdmin && !isSuperadmin) {
      toast.error('Access denied. Admin or Superadmin role required.');
      window.location.href = '/dashboard';
    }
  }, [isAdmin, isSuperadmin]);

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(page, pagination.limit, searchTerm, roleFilter !== 'all' ? roleFilter : '');
      if (response.success) {
        setUsers(response.users || []);
        setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isSuperadmin) {
      loadUsers();
    }
  }, [isAdmin, isSuperadmin]);

  // Reload when filters change
  useEffect(() => {
    if (isAdmin || isSuperadmin) {
      loadUsers(1);
    }
  }, [searchTerm, isTeamScopedAdmin]);

  useEffect(() => {
    if (isSuperadmin) {
      loadUsers(1);
    }
  }, [roleFilter]);

  const handleUserAvatarClick = (userId) => {
    if (userId) {
      setSelectedUserId(userId);
      setShowUserDetails(true);
    }
  };

  const handleViewDetails = (userId) => {
    setSelectedUserId(userId);
    setShowUserDetails(true);
  };

  const handleEditRole = (userItem) => {
    if (!isSuperadmin) {
      toast.error('Only superadmin can assign roles');
      return;
    }
    setSelectedUserForRole(userItem);
    setNewRole(userItem.role || 'user');
    setShowRoleModal(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUserForRole) return;
    
    try {
      const response = await userService.assignUserRole(selectedUserForRole.id || selectedUserForRole._id, newRole);
      if (response.success) {
        toast.success(`User role updated to ${newRole} successfully`);
        setShowRoleModal(false);
        setSelectedUserForRole(null);
        loadUsers(pagination.page);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(error.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleEditVerification = (userItem) => {
    if (!canUpdateVerification) {
      toast.error('Insufficient permissions to update email verification');
      return;
    }
    setSelectedUserForVerification(userItem);
    setNewVerificationValue(!!userItem.emailVerified);
    setShowVerificationModal(true);
  };

  const handleUpdateVerification = async () => {
    if (!selectedUserForVerification) return;

    try {
      const response = await userService.updateUserVerification(
        selectedUserForVerification.id || selectedUserForVerification._id,
        newVerificationValue
      );
      if (response.success) {
        toast.success(`Email verification updated successfully`);
        setShowVerificationModal(false);
        setSelectedUserForVerification(null);
        loadUsers(pagination.page);
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error(error.response?.data?.message || 'Failed to update verification');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isSuperadmin) {
      toast.error('Only superadmin can delete users');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        loadUsers(pagination.page);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    
    try {
      const response = await authService.createUser(createUserForm);
      if (response.message === 'user registered successfully') {
        toast.success('User created successfully');
        setShowCreateUser(false);
        setCreateUserForm({ username: '', email: '', password: '', role: 'user' });
        loadUsers(pagination.page);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter;
    
    const matchesPermissions = permissionsFilter === 'all' || 
      (permissionsFilter === 'with_permissions' && userItem.permissions) ||
      (permissionsFilter === 'without_permissions' && !userItem.permissions);

    return matchesSearch && matchesRole && matchesPermissions;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getVerificationBadgeColor = (verified) => {
    return verified
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getPermissionCount = (permissions) => {
    if (!permissions) return 0;
    return Object.values(permissions).filter(value => 
      typeof value === 'boolean' && value
    ).length;
  };

  const getJoinedDate = (id, createdAt) => {
    if (createdAt) {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    try {
      if (!id) return '';
      const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return '';
    }
  };

  if (loading && users.length === 0) {
    return (
      <HorizontalLoader 
        message="Loading users..."
        subMessage="Fetching user data and permissions"
        progress={70}
        className="min-h-screen"
      />
    );
  }

  return (
    <div className="ambient-light mt-10">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex py-6 gap-3 items-center justify-between fixed z-10 md:-top-3 -top-30 z-10">
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
            <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
              <PiUsersDuotone size={15} />
            </div>
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          {isSuperadmin && (
            <Button
              onClick={() => setShowCreateUser(true)}
              className="bg-black dark:bg-white text-white font-bold dark:text-black w-[200px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              New User
            </Button>
          )}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 "
        >
          {isTeamScopedAdmin && (
            <div className="bg-amber-50 border w-fit border-amber-200 text-amber-900 text-sm rounded-[12px] px-6 py-3 font-bold mb-2">
              Admins can only view users from teams they created. Contact a superadmin to manage global roles.
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 md:w-auto w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-[500px] bg-white dark:bg-[#111827] text-black dark:text-white border border-gray-200 dark:border-gray-700 rounded-[10px]"
              />
            </div>
            <div className="flex gap-3 w-full">
            <Select 
              value={roleFilter} 
              onValueChange={setRoleFilter} 
              disabled={!isSuperadmin}
            >
              <SelectTrigger className="md:w-[180px] w-1/2 px-5 cursor-pointer bg-white dark:bg-[#111827] text-black dark:text-white h-13">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className={'h-10 px-5 cursor-pointer'} value="all">All Roles</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="user">User</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="admin">Admin</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={permissionsFilter} onValueChange={setPermissionsFilter}>
              <SelectTrigger className="md:w-[180px] w-1/2 bg-white px-5 cursor-pointer dark:bg-[#111827] text-black dark:text-white h-13">
                <SelectValue placeholder="Filter by permissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="all">All Users</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="with_permissions">With Permissions</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="without_permissions">Without Permissions</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full rounded-[10px] overflow-hidden">
              <thead className="bg-white text-black rounded-[10px] dark:border-gray-700 sticky top-0 z-10">
                <tr className="rounded-t-r-[10px]">
                  <th className="px-5 py-4 rounded-[10px] text-left text-xs text-black dark:text-black uppercase tracking-wider">User</th>
                  <th className="px-5 py-4 text-left text-xs text-black dark:text-black uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-left text-xs text-black dark:text-black uppercase tracking-wider truncate">Email Verification</th>
                  <th className="px-5 py-4 text-left text-xs text-black dark:text-black uppercase tracking-wider">Permissions</th>
                  <th className="px-5 py-4 text-left text-xs text-black dark:text-black uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-4 text-left text-xs text-black dark:text-black uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem) => (
                    <tr key={userItem.id || userItem._id} className="bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-black">
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-3">
                          <img
                            {...getAvatarProps(userItem.avatar, userItem.username)}
                            alt={userItem.username}
                            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleUserAvatarClick(userItem.id || userItem._id)}
                            title={userItem.username ? `View ${userItem.username}'s profile` : 'View profile'}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{userItem.username}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{userItem.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2">
                        <Badge className={getRoleBadgeColor(userItem.role)}>{userItem.role || 'user'}</Badge>
                      </td>
                    <td className="px-5 py-2">
                      <Badge className={getVerificationBadgeColor(userItem.emailVerified)}>
                        {userItem.emailVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 icon text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{getPermissionCount(userItem.permissions)} Permissions</span>
                        </div>
                      </td>
                      <td className="px-5 py-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{getJoinedDate(userItem.id || userItem._id, userItem.createdAt)}</div>
                      </td>
                      <td className="px-5 py-2 flex items-center justify-end">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-10 h-10 bg-transparent border-none"
                            title="View Details"
                            onClick={() => handleViewDetails(userItem.id || userItem._id)}
                          >
                            <Eye className="w-4 h-4 icon" />
                          </Button>
                          {canAssignRoles && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-10 h-10 bg-transparent border-none"
                              title="Change Role"
                              onClick={() => handleEditRole(userItem)}
                            >
                              <Edit className="w-4 h-4 icon" />
                            </Button>
                          )}
                          {canUpdateVerification && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-10 h-10 bg-transparent border-none"
                              title="Update Email Verification"
                              onClick={() => handleEditVerification(userItem)}
                            >
                              <Mail className="w-4 h-4 icon" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-10 h-10 bg-transparent border-none"
                            title="Edit Permissions"
                            onClick={() => window.location.href = `/dashboard/admin/permissions?userId=${userItem.id || userItem._id}`}
                          >
                            <Shield className="w-4 h-4 icon" />
                          </Button>
                          {isSuperadmin && userItem.role !== 'superadmin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-10 h-10 text-red-600 hover:text-red-700"
                              title="Delete User"
                              onClick={() => handleDeleteUser(userItem.id || userItem._id)}
                            >
                              <Trash2 className="w-4 h-4 icon" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => loadUsers(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              onClick={() => loadUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-[30px] p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New User</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateUser(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  value={createUserForm.username}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })}
                  required
                  className="bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  required
                  className="bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  required
                  minLength={6}
                  className="bg-white dark:bg-gray-700"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingUser} className="bg-black dark:bg-white">
                  {creatingUser ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-[30px] p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Change Role - {selectedUserForRole.username}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowRoleModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignRole} className="bg-black dark:bg-white">
                  Assign Role
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Update Verification Modal */}
      {showVerificationModal && selectedUserForVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-[30px] p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Update Verification - {selectedUserForVerification.username}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowVerificationModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Verification Status</label>
                <Select
                  value={newVerificationValue ? 'true' : 'false'}
                  onValueChange={(value) => setNewVerificationValue(value === 'true')}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowVerificationModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateVerification} className="bg-black dark:bg-white">
                  Update Status
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};

export default UserManagement;
