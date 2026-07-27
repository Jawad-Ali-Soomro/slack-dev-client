import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Check,
  Edit2Icon,
  FolderOpen,
  Eye,
  ClipboardList,
  User,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Checkbox } from "../../components/ui/checkbox";
import HorizontalLoader from "../../components/HorizontalLoader";
import permissionsService from "../../services/permissionsService";
import { useAuth } from "../../contexts/AuthContext";
import { getAvatarProps } from "../../utils/avatarUtils";
import { toast } from "sonner";
import UserDetailsModal from "../../components/UserDetailsModal";
import { PiUserDuotone, PiUsersDuotone } from "react-icons/pi";

const ROLE_CONFIG = {
  superadmin: {
    label: "Super Admin",
    icon: Crown,
    chip: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    chip: "bg-gradient-to-br from-rose-500 to-red-500",
    pill: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
  user: {
    label: "User",
    icon: PiUserDuotone,
    chip: "bg-gradient-to-br from-slate-400 to-slate-500",
    pill: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  },
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 py-1 pl-1 pr-3 rounded-full text-xs font-semibold border",
        cfg.pill,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded-full text-white shadow-sm",
          cfg.chip,
        )}
      >
        <Icon className="w-3 h-3" />
      </span>
      {cfg.label}
    </span>
  );
};

const PERMISSION_BADGES = [
  {
    key: "canCreateTeam",
    label: "Teams",
    desc: "Can Create Teams",
    icon: PiUsersDuotone,
    chip: "bg-gradient-to-br from-blue-500 to-sky-500",
    pill: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  {
    key: "canCreateProject",
    label: "Projects",
    desc: "Can Create Projects",
    icon: FolderOpen,
    chip: "bg-gradient-to-br from-orange-500 to-amber-500",
    pill: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  },
  {
    key: "canCreateTask",
    label: "Tasks",
    desc: "Can Create Tasks",
    icon: ClipboardList,
    chip: "bg-gradient-to-br from-green-500 to-emerald-500",
    pill: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
  },
  {
    key: "canCreateMeeting",
    label: "Meetings",
    desc: "Can Create Meetings",
    icon: Calendar,
    chip: "bg-gradient-to-br from-violet-500 to-purple-500",
    pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  },
  {
    key: "canManageUsers",
    label: "Users",
    desc: "Can Manage Users",
    icon: Shield,
    chip: "bg-gradient-to-br from-indigo-500 to-blue-500",
    pill: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  },
  {
    key: "canViewAllData",
    label: "View Data",
    desc: "Can View All Data",
    icon: Eye,
    chip: "bg-gradient-to-br from-amber-500 to-yellow-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
];

const PermissionBadge = ({ config }) => {
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 py-1 pl-1 pr-3 rounded-full text-xs font-semibold border",
        config.pill,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded-full text-white shadow-sm",
          config.chip,
        )}
      >
        <Icon className="w-3 h-3" />
      </span>
      {config.label}
    </span>
  );
};

const PermissionsManagement = () => {
  const { user, isAdmin, isSuperadmin } = useAuth();
  const isTeamScopedAdmin = isAdmin && !isSuperadmin;
  const canFilterByRole = isSuperadmin;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [permissions, setPermissions] = useState({
    canCreateTeam: false,
    canCreateProject: false,
    canCreateTask: false,
    canCreateMeeting: false,
    canManageUsers: false,
    canViewAllData: false,
  });

  useEffect(() => {
    if (!isAdmin && !isSuperadmin) {
      toast.error("Access denied. Admin or Superadmin role required.");
      window.location.href = "/dashboard";
    }
  }, [isAdmin, isSuperadmin]);

  document.title = "Permission Management";

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await permissionsService.getAllUsersWithPermissions();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
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

  const filteredUsers = users.filter((userItem) => {
    const matchesSearch =
      userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || userItem.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getJoinedDate = (id, createdAt) => {
    if (createdAt) {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    try {
      if (!id) return "";
      const ts = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(ts).toLocaleDateString();
    } catch {
      return "";
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
        canViewAllData: userItem.permissions.canViewAllData || false,
      });
    } else {
      setPermissions({
        canCreateTeam: false,
        canCreateProject: false,
        canCreateTask: false,
        canCreateMeeting: false,
        canManageUsers: false,
        canViewAllData: false,
      });
    }
  };

  const handleSavePermissions = async () => {
    try {
      const response = await permissionsService.createOrUpdatePermissions(
        editingUser.id,
        permissions,
      );
      if (response.success) {
        toast.success("Permissions updated successfully");
        setEditingUser(null);
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    }
  };

  const handleDeletePermissions = async (userId) => {
    try {
      const response = await permissionsService.deletePermissions(userId);
      if (response.success) {
        toast.success("Permissions deleted successfully");
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error("Error deleting permissions:", error);
      toast.error("Failed to delete permissions");
    }
  };

  const getPermissionCount = (permissions) => {
    if (!permissions) return 0;
    return Object.values(permissions).filter(
      (value) => typeof value === "boolean" && value,
    ).length;
  };

  const getUserId = (userItem) => userItem.id || userItem._id;

  // Only users that actually have a permissions record can have them removed.
  const isSelectable = (userItem) => Boolean(userItem.permissions);

  const handleSelectAll = () => {
    const selectableIds = filteredUsers.filter(isSelectable).map(getUserId);
    if (
      selectableIds.length > 0 &&
      selectedUsers.length === selectableIds.length
    ) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(selectableIds);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }
    if (
      !confirm(
        `Remove permissions for ${selectedUsers.length} user(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const results = await Promise.allSettled(
        selectedUsers.map((id) => permissionsService.deletePermissions(id)),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const cleared = selectedUsers.length - failed;

      setSelectedUsers([]);
      await loadUsers();

      if (cleared > 0)
        toast.success(`Permissions removed for ${cleared} user(s)`);
      if (failed > 0) toast.error(`${failed} user(s) could not be updated.`);
    } catch (error) {
      console.error("Error removing permissions:", error);
      toast.error("Failed to remove permissions");
    } finally {
      setLoading(false);
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
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[15px]">
            <div className="flex p-3 bg-white  dark:bg-gray-800 rounded-[15px]">
              <Shield size={15} />
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
              Admins can only view and manage permissions for members of teams
              they created. Contact a superadmin for full access.
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 icon" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white dark:bg-[black] text-black dark:text-white border border-gray-200 dark:border-gray-700 w-full md:w-[500px] rounded-[15px]"
              />
            </div>
            <div className="flex items-center w-full sm:w-auto">
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
                disabled={!canFilterByRole}
              >
                <SelectTrigger className="md:w-44 w-full sm:w-44 h-12 px-5 text-gray-600 dark:text-white cursor-pointer bg-white dark:bg-[black] rounded-[15px] disabled:opacity-60 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    className={"px-5 cursor-pointer h-10"}
                    value="all"
                  >
                    All Roles
                  </SelectItem>
                  <SelectItem
                    className={"px-5 cursor-pointer h-10"}
                    value="user"
                  >
                    User
                  </SelectItem>
                  <SelectItem
                    className={"px-5 cursor-pointer h-10"}
                    value="admin"
                  >
                    Admin
                  </SelectItem>
                  <SelectItem
                    className={"px-5 cursor-pointer h-10"}
                    value="superadmin"
                  >
                    Super Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Bulk actions bar */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 mb-3 px-4 py-3 rounded-[15px] border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
          >
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-[12px]"
                onClick={() => setSelectedUsers([])}
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="rounded-[12px] bg-red-600 hover:bg-red-700 text-white"
                onClick={handleBulkDelete}
              >
                <X className="w-4 h-4 mr-1.5" />
                Remove Permissions ({selectedUsers.length})
              </Button>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-[15px] border border-gray-100 dark:border-white/10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-white backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-4 text-left items-center justify-center w-12">
                    <Checkbox
                      checked={(() => {
                        const selectable = filteredUsers.filter(isSelectable);
                        if (selectable.length === 0) return false;
                        if (selectedUsers.length === selectable.length)
                          return true;
                        return selectedUsers.length > 0
                          ? "indeterminate"
                          : false;
                      })()}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all users"
                      className={"mt-1"}
                    />
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-black uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-black uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-black uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-black uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] font-semibold text-gray-500 dark:text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-black"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem) => (
                    <tr
                      key={userItem.id}
                      className={cn(
                        "bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
                        selectedUsers.includes(getUserId(userItem)) &&
                          "bg-red-50/60 dark:bg-red-500/5",
                      )}
                    >
                      <td className="px-5 py-3 w-12">
                        {isSelectable(userItem) ? (
                          <Checkbox
                            checked={selectedUsers.includes(
                              getUserId(userItem),
                            )}
                            onCheckedChange={() =>
                              handleSelectUser(getUserId(userItem))
                            }
                            aria-label={`Select ${userItem.username}`}
                          />
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            {...getAvatarProps(
                              userItem.avatar,
                              userItem.username,
                            )}
                            alt={userItem.username}
                            className="w-9 h-9 rounded-[12px] object-cover cursor-pointer hover:opacity-80 transition-opacity ring-1 ring-gray-100 dark:ring-white/10"
                            onClick={() =>
                              handleUserAvatarClick(userItem.id || userItem._id)
                            }
                            title={
                              userItem.username
                                ? `View ${userItem.username}'s profile`
                                : "View profile"
                            }
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {userItem.username}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {userItem.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <RoleBadge role={userItem.role} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {userItem.permissions &&
                          getPermissionCount(userItem.permissions) > 0 ? (
                            PERMISSION_BADGES.filter(
                              (p) => userItem.permissions[p.key],
                            ).map((p) => (
                              <PermissionBadge key={p.key} config={p} />
                            ))
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                              No permissions
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getJoinedDate(userItem.id, userItem.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="w-10 h-10 justify-center rounded-[12px] bg-theme hover:bg-theme text-white"
                            onClick={() => handleEditPermissions(userItem)}
                            title="Edit permissions"
                          >
                            <Edit2Icon className="w-4 h-4" />
                          </Button>
                          {userItem.permissions && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDeletePermissions(userItem.id)
                              }
                              className="h-10 w-10 justify-center rounded-[12px] border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                              title="Remove permissions"
                            >
                              <X className="w-4 h-4" />
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

        {/* Edit Permissions Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[18px] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div
                className="flex items-center justify-between mb-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-theme" />
                  Edit Permissions · {editingUser.username}
                </h2>
                <Button
                  variant="ghost"
                  className="h-12 w-12 justify-center rounded-[12px]"
                  onClick={() => setEditingUser(null)}
                >
                  <X className="w-4 h-4 icon icon" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PERMISSION_BADGES.map((p) => {
                    const Icon = p.icon;
                    const checked = permissions[p.key];
                    return (
                      <label
                        key={p.key}
                        htmlFor={p.key}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-[15px] border cursor-pointer transition-colors",
                          checked
                            ? "border-theme-subtle bg-theme-subtle"
                            : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5",
                        )}
                      >
                        <Checkbox
                          id={p.key}
                          checked={checked}
                          onCheckedChange={(value) =>
                            setPermissions((prev) => ({
                              ...prev,
                              [p.key]: value,
                            }))
                          }
                        />
                        <span
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-white shadow-sm flex-shrink-0",
                            p.chip,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {p.desc}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  className="rounded-[12px] w-[150px]"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePermissions}
                  className="rounded-[12px] w-[200px] bg-theme hover:bg-theme text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
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
