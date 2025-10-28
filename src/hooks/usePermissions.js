import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import permissionsService from '../services/permissionsService';

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState({
    canCreateTeam: false,
    canCreateProject: false,
    canCreateTask: false,
    canCreateMeeting: false,
    canManageUsers: false,
    canViewAllData: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // If user is admin, they have all permissions
        if (user.role === 'admin' || user.role === 'superadmin') {
          setPermissions({
            canCreateTeam: true,
            canCreateProject: true,
            canCreateTask: true,
            canCreateMeeting: true,
            canManageUsers: true,
            canViewAllData: true
          });
        } else {
          // Check specific permissions for regular users
          const response = await permissionsService.getUserPermissions(user.id);
          if (response.success) {
            setPermissions(response.permissions);
          }
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        // Default to no permissions if there's an error
        setPermissions({
          canCreateTeam: false,
          canCreateProject: false,
          canCreateTask: false,
          canCreateMeeting: false,
          canManageUsers: false,
          canViewAllData: false
        });
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user]);

  return { permissions, loading };
};
