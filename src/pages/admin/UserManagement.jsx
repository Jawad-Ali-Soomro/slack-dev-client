import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Crown,
  Mail,
  Calendar,
  Eye
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import HorizontalLoader from '../../components/HorizontalLoader';
import permissionsService from '../../services/permissionsService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { getAvatarProps } from '../../utils/avatarUtils';
import { PiUserDuotone, PiUsersDuotone } from 'react-icons/pi';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [permissionsFilter, setPermissionsFilter] = useState('all');

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin role required.');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  }, [user]);

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
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesPermissions = permissionsFilter === 'all' || 
      (permissionsFilter === 'with_permissions' && user.permissions) ||
      (permissionsFilter === 'without_permissions' && !user.permissions);

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

  const getPermissionCount = (permissions) => {
    if (!permissions) return 0;
    return Object.values(permissions).filter(value => 
      typeof value === 'boolean' && value
    ).length;
  };

  // Some user documents might not have timestamps; derive join date from ObjectId
  const getJoinedDate = (id, fallback) => {
    try {
      if (!id) return fallback || '';
      const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return fallback || '';
    }
  };

  if (loading) {
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
    <div className=" ambient-light">
      <div className="mt-10 mx-auto">
        {/* Header - simple, no cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PiUsersDuotone className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl  text-gray-900 dark:text-white">User Management</h1>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin Access</span>
          </div>
        </motion.div>

        {/* Filters */}
        {/* Filters - simple row, no cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 max-w-[600px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-44 h-12 px-5">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="all">All Roles</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="user">User</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="admin">Admin</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={permissionsFilter} onValueChange={setPermissionsFilter}>
              <SelectTrigger className="w-56 h-12">
                <SelectValue placeholder="Filter by permissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="all">All Users</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="with_permissions">With Permissions</SelectItem>
                <SelectItem className={'px-5 cursor-pointer h-10'} value="without_permissions">Without Permissions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full rounded-[10px] overflow-hidden">
              <thead className="bg-gray-100 text-black rounded-[10px] dark:border-gray-700 sticky top-0 z-10">
                <tr className="rounded-t-r-[10px]">
                  <th className="px-5 py-4 rounded-[10px] text-left text-xs  text-black dark:text-black uppercase tracking-wider">User</th>
                  <th className="px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">Permissions</th>
                  <th className="px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-black">
                    <td className="px-5 py-2">
                      <div className="flex items-center gap-3">
                        <img
                          {...getAvatarProps(userItem.avatar, userItem.username)}
                          alt={userItem.username}
                          className="w-8 h-8 rounded-full object-cover"
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
                    <td className="px-5 py-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 icon text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{getPermissionCount(userItem.permissions)} permissions</span>
                      </div>
                    </td>
                    <td className="px-5 py-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{getJoinedDate(userItem.id, '')}</div>
                    </td>
                    <td className="px-5 py-2 flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-2 w-12">
                            <MoreVertical className="w-4 h-4 icon" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className={'px-5 h-10 cursor-pointer'}>
                            <Eye className="w-4 h-4 icon mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className={'px-5 h-10 cursor-pointer'}>
                            <Edit className="w-4 h-4 icon mr-2" />
                            Edit Permissions
                          </DropdownMenuItem>
                          {userItem.role !== 'admin' && userItem.role !== 'superadmin' && (
                            <DropdownMenuItem className="text-red-600 px-5 h-10">
                              <Trash2 className="w-4 h-4 icon mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserManagement;
