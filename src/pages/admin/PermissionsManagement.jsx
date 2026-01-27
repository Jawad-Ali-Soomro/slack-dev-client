import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Save, 
  X,
  CheckCircle,
  XCircle,
  Crown,
  Mail,
  Calendar,
  Settings,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Checkbox } from '../../components/ui/checkbox';
import HorizontalLoader from '../../components/HorizontalLoader';
import permissionsService from '../../services/permissionsService';
import { useAuth } from '../../contexts/AuthContext';
import { getAvatarProps } from '../../utils/avatarUtils';
import { toast } from 'sonner';
import UserDetailsModal from '../../components/UserDetailsModal';

const PermissionsManagement = () => {
  const { user, isAdmin, isSuperadmin } = useAuth();
  const isTeamScopedAdmin = isAdmin && !isSuperadmin;
  const canFilterByRole = isSuperadmin;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [permissions, setPermissions] = useState({
    canCreateTeam: false,
    canCreateProject: false,
    canCreateTask: false,
    canCreateMeeting: false,
    canManageUsers: false,
    canViewAllData: false
  });

  useEffect(() => {
    if (!isAdmin && !isSuperadmin) {
      toast.error('Access denied. Admin or Superadmin role required.');
      window.location.href = '/dashboard';
    }
  }, [isAdmin, isSuperadmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await permissionsService.getAllUsersWithPermissions();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isSuperadmin) {
      loadUsers();
    }
  }, [isAdmin, isSuperadmin]);

  const handleUserAvatarClick = (userId) => {
    if (userId) {
      setSelectedUserId(userId);
      setShowUserDetails(true);
    }
  };

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getJoinedDate = (id, createdAt) => {
    if (createdAt) {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    try {
      if (!id) return '';
      const ts = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(ts).toLocaleDateString();
    } catch {
      return '';
    }
  };

  const handleEditPermissions = (userItem) => {
    setEditingUser(userItem);
    if (userItem.permissions) {
      setPermissions({
        canCreateTeam: userItem.permissions.canCreateTeam || false,
        canCreateProject: userItem.permissions.canCreateProject || false,
        canCreateTask: userItem.permissions.canCreateTask || false,
        canCreateMeeting: userItem.permissions.canCreateMeeting || false,
        canManageUsers: userItem.permissions.canManageUsers || false,
        canViewAllData: userItem.permissions.canViewAllData || false
      });
    } else {
      setPermissions({
        canCreateTeam: false,
        canCreateProject: false,
        canCreateTask: false,
        canCreateMeeting: false,
        canManageUsers: false,
        canViewAllData: false
      });
    }
  };

  const handleSavePermissions = async () => {
    try {
      const response = await permissionsService.createOrUpdatePermissions(editingUser.id, permissions);
      if (response.success) {
        toast.success('Permissions updated successfully');
        setEditingUser(null);
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  const handleDeletePermissions = async (userId) => {
    try {
      const response = await permissionsService.deletePermissions(userId);
      if (response.success) {
        toast.success('Permissions deleted successfully');
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error('Error deleting permissions:', error);
      toast.error('Failed to delete permissions');
    }
  };

  const getPermissionCount = (permissions) => {
    if (!permissions) return 0;
    return Object.values(permissions).filter(value => 
      typeof value === 'boolean' && value
    ).length;
  };

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

  if (loading) {
    return (
      <HorizontalLoader 
        message="Loading permissions..."
        subMessage="Fetching user permissions data"
        progress={80}
        className="min-h-screen"
      />
    );
  }

  return (
    <div className="ambient-light mt-10">
      <div className="mx-auto">
        {/* Header - no cards */}
        <div className="flex py-6 gap-3 items-center fixed z-10 md:-top-3 -top-30 z-10">
        <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
        <div className="flex p-3 bg-white  dark:bg-gray-800 rounded-full">
                  <Shield  size={15} />
                  </div>
                  <h1 className="text-2xl font-bold">Permissions Management</h1>
                </div>
                </div>

        {/* Filters */}
        {/* Filters - no padding/cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          {isTeamScopedAdmin && (
            <div className="bg-amber-50 border w-fit border-amber-200 text-amber-900 text-sm rounded-[12px] px-6 py-3 font-bold mb-2">
              Admins can only view and manage permissions for members of teams they created. Contact a superadmin for full access.
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 icon" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white dark:bg-[#111827] text-black dark:text-white border border-gray-200 dark:border-gray-700 w-full md:w-[500px] rounded-[10px]"
              />
            </div>
            <div className="flex items-center w-full sm:w-auto">
              <Select 
                value={roleFilter} 
                onValueChange={setRoleFilter}
                disabled={!canFilterByRole}
              >
                <SelectTrigger className="md:w-44 w-full sm:w-44 h-12 px-5 text-gray-600 dark:text-white cursor-pointer bg-white dark:bg-[#111827] rounded-[10px] disabled:opacity-60 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className={'px-5 cursor-pointer h-10'} value="all">All Roles</SelectItem>
                  <SelectItem className={'px-5 cursor-pointer h-10'} value="user">User</SelectItem>
                  <SelectItem className={'px-5 cursor-pointer h-10'} value="admin">Admin</SelectItem>
                  <SelectItem className={'px-5 cursor-pointer h-10'} value="superadmin">Super Admin</SelectItem>
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
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-[20px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full rounded-[10px] overflow-hidden">
              <thead className="bg-white text-black dark:border-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">User</th>
                  <th className="px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">Permissions</th>
                  <th className="px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-black">
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
                      <Badge className={getRoleBadgeColor(userItem.role)}>{userItem.role}</Badge>
                    </td>
                    <td className="px-5 py-2 ">
                      <div className="flex flex-wrap gap-2">
                        {userItem.permissions ? (
                          <>
                            {userItem.permissions.canCreateTeam && (<Badge variant="outline" className="text-xs">Teams</Badge>)}
                            {userItem.permissions.canCreateProject && (<Badge variant="outline" className="text-xs">Projects</Badge>)}
                            {userItem.permissions.canCreateTask && (<Badge variant="outline" className="text-xs">Tasks</Badge>)}
                            {userItem.permissions.canCreateMeeting && (<Badge variant="outline" className="text-xs">Meetings</Badge>)}
                            {userItem.permissions.canManageUsers && (<Badge variant="outline" className="text-xs">Users</Badge>)}
                            {userItem.permissions.canViewAllData && (<Badge variant="outline" className="text-xs">All Data</Badge>)}
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">No permissions</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{getJoinedDate(userItem.id, userItem.createdAt)}</div>
                    </td>
                    <td className="px-5 py-2 flex items-center justify-end pr-5">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className={'w-12'} onClick={() => handleEditPermissions(userItem)}>
                <Edit className="w-4 h-4 icon icon" />
                        </Button>
                        {userItem.permissions && (
                          <Button variant="outline" size="sm" onClick={() => handleDeletePermissions(userItem.id)} className="text-red-600 w-12 hover:text-red-700">
                            <X className="w-4 h-4 icon" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Edit Permissions Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-[30px] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"

            >
              <div className="flex items-center justify-between mb-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl  text-gray-900 dark:text-white">
                  Edit Permissions - {editingUser.username}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                >
                  <X className="w-4 h-4 icon" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="canCreateTeam"
                      checked={permissions.canCreateTeam}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, canCreateTeam: checked }))
                      }
                    />
                    <label htmlFor="canCreateTeam" className="text-sm font-medium">
                      Can Create Teams
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="canCreateProject"
                      checked={permissions.canCreateProject}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, canCreateProject: checked }))
                      }
                    />
                    <label htmlFor="canCreateProject" className="text-sm font-medium">
                      Can Create Projects
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="canCreateTask"
                      checked={permissions.canCreateTask}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, canCreateTask: checked }))
                      }
                    />
                    <label htmlFor="canCreateTask" className="text-sm font-medium">
                      Can Create Tasks
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="canCreateMeeting"
                      checked={permissions.canCreateMeeting}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, canCreateMeeting: checked }))
                      }
                    />
                    <label htmlFor="canCreateMeeting" className="text-sm font-medium">
                      Can Create Meetings
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="canManageUsers"
                      checked={permissions.canManageUsers}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, canManageUsers: checked }))
                      }
                    />
                    <label htmlFor="canManageUsers" className="text-sm font-medium">
                      Can Manage Users
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="canViewAllData"
                      checked={permissions.canViewAllData}
                      onCheckedChange={(checked) => 
                        setPermissions(prev => ({ ...prev, canViewAllData: checked }))
                      }
                    />
                    <label htmlFor="canViewAllData" className="text-sm font-medium">
                      Can View All Data
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePermissions}
                  className="bg-black dark:bg-white"
                >
                  <Check className="w-4 h-4 icon mr-2" />
                  Save Permissions
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

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

export default PermissionsManagement;
