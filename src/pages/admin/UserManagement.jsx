import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Search,
  Filter,
  Edit,
  Trash2,
  Crown,
  Mail,
  Calendar,
  Eye,
  Plus,
  UserPlus,
  X,
  MoreVertical,
  User,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
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
import HorizontalLoader from "../../components/HorizontalLoader";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { getAvatarProps } from "../../utils/avatarUtils";
import {
  PiUserCheckDuotone,
  PiUserDuotone,
  PiUserMinusDuotone,
  PiUserPlusDuotone,
  PiUsersDuotone,
} from "react-icons/pi";
import UserDetailsModal from "../../components/UserDetailsModal";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";

// Shared badge style matching the status badges used across the app (see Tasks).
const BADGE_BASE =
  "inline-flex items-center gap-1.5 rounded-[15px] px-3 py-1 text-xs font-medium backdrop-blur-sm border";

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

const VerificationBadge = ({ verified }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 py-1 pl-1 pr-3 rounded-full text-xs font-semibold border",
      verified
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
        : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    )}
  >
    <span
      className={cn(
        "flex items-center justify-center w-5 h-5 rounded-full text-white shadow-sm",
        verified
          ? "bg-gradient-to-br from-emerald-500 to-green-500"
          : "bg-gradient-to-br from-amber-500 to-orange-500",
      )}
    >
      {verified ? (
        <PiUserCheckDuotone className="w-3 h-3" />
      ) : (
        <PiUserMinusDuotone className="w-3 h-3" />
      )}
    </span>
    {verified ? "Verified" : "Pending"}
  </span>
);

const UserManagement = () => {
  const { user, isSuperadmin, isAdmin } = useAuth();
  const isTeamScopedAdmin = isAdmin && !isSuperadmin;
  const canAssignRoles = isSuperadmin;
  const canUpdateVerification = isAdmin;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [permissionsFilter, setPermissionsFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [newRole, setNewRole] = useState("user");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedUserForVerification, setSelectedUserForVerification] =
    useState(null);
  const [newVerificationValue, setNewVerificationValue] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [createUserForm, setCreateUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [creatingUser, setCreatingUser] = useState(false);

  document.title = "Manage Users";

  useEffect(() => {
    if (!isAdmin && !isSuperadmin) {
      toast.error("Access denied. Admin or Superadmin role required.");
      window.location.href = "/dashboard";
    }
  }, [isAdmin, isSuperadmin]);

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(
        page,
        pagination.limit,
        searchTerm,
        roleFilter !== "all" ? roleFilter : "",
      );
      if (response.success) {
        setUsers(response.users || []);
        setPagination(
          response.pagination || { page: 1, limit: 20, total: 0, pages: 0 },
        );
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isSuperadmin) {
      loadUsers();
    }
  }, [isAdmin, isSuperadmin]);

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
      toast.error("Only superadmin can assign roles");
      return;
    }
    setSelectedUserForRole(userItem);
    setNewRole(userItem.role || "user");
    setShowRoleModal(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUserForRole) return;

    try {
      const response = await userService.assignUserRole(
        selectedUserForRole.id || selectedUserForRole._id,
        newRole,
      );
      if (response.success) {
        toast.success(`User role updated to ${newRole} successfully`);
        setShowRoleModal(false);
        setSelectedUserForRole(null);
        loadUsers(pagination.page);
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error(error.response?.data?.message || "Failed to assign role");
    }
  };

  const handleEditVerification = (userItem) => {
    if (!canUpdateVerification) {
      toast.error("Insufficient permissions to update email verification");
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
        newVerificationValue,
      );
      if (response.success) {
        toast.success(`Email verification updated successfully`);
        setShowVerificationModal(false);
        setSelectedUserForVerification(null);
        loadUsers(pagination.page);
      }
    } catch (error) {
      console.error("Error updating verification:", error);
      toast.error(
        error.response?.data?.message || "Failed to update verification",
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isSuperadmin) {
      toast.error("Only superadmin can delete users");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        toast.success("User deleted successfully");
        loadUsers(pagination.page);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const getUserId = (userItem) => userItem.id || userItem._id;

  const isSelectable = (userItem) =>
    isSuperadmin && userItem.role !== "superadmin";

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
    if (!isSuperadmin) {
      toast.error("Only superadmin can delete users");
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const results = await Promise.allSettled(
        selectedUsers.map((id) => userService.deleteUser(id)),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const deleted = selectedUsers.length - failed;

      setSelectedUsers([]);
      await loadUsers(pagination.page);

      if (deleted > 0) toast.success(`${deleted} user(s) deleted successfully`);
      if (failed > 0) toast.error(`${failed} user(s) could not be deleted.`);
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error(error.response?.data?.message || "Failed to delete users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);

    try {
      const response = await authService.createUser(createUserForm);
      if (response.message === "user registered successfully") {
        toast.success("User created successfully");
        setShowCreateUser(false);
        setCreateUserForm({
          username: "",
          email: "",
          password: "",
          role: "user",
        });
        loadUsers(pagination.page);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = users.filter((userItem) => {
    const matchesSearch =
      userItem.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || userItem.role === roleFilter;

    const matchesPermissions =
      permissionsFilter === "all" ||
      (permissionsFilter === "with_permissions" && userItem.permissions) ||
      (permissionsFilter === "without_permissions" && !userItem.permissions);

    return matchesSearch && matchesRole && matchesPermissions;
  });

  const getPermissionCount = (permissions) => {
    if (!permissions) return 0;
    return Object.values(permissions).filter(
      (value) => typeof value === "boolean" && value,
    ).length;
  };

  const getJoinedDate = (id, createdAt) => {
    if (createdAt) {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    try {
      if (!id) return "";
      const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return "";
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
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[15px]">
            <div className="flex p-3 bg-white dark:bg-gray-800 rounded-[15px]">
              <PiUsersDuotone size={15} />
            </div>
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          {isSuperadmin && (
            <Button
              onClick={() => setShowCreateUser(true)}
              className="bg-theme h-14 hover:bg-theme text-white font-bold w-[200px]"
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
              Admins can only view users from teams they created. Contact a
              superadmin to manage global roles.
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 md:w-auto w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 icon" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-[500px] bg-white dark:bg-[black] text-black dark:text-white border border-gray-200 dark:border-gray-700 rounded-[15px]"
              />
            </div>
            <div className="flex gap-3 w-full">
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
                disabled={!isSuperadmin}
              >
                <SelectTrigger className="md:w-[180px] w-1/2 px-5 text-gray-600 dark:text-white cursor-pointer bg-white dark:bg-[black] h-13">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    className={"h-10 px-5 cursor-pointer"}
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
              <Select
                value={permissionsFilter}
                onValueChange={setPermissionsFilter}
              >
                <SelectTrigger className="md:w-[180px] w-1/2 bg-white px-5 text-gray-600 dark:text-white cursor-pointer dark:bg-[black] h-13">
                  <SelectValue placeholder="Filter by permissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    className={"px-5 cursor-pointer h-10"}
                    value="all"
                  >
                    All Users
                  </SelectItem>
                  <SelectItem
                    className={"px-5 cursor-pointer h-10"}
                    value="with_permissions"
                  >
                    With Permissions
                  </SelectItem>
                  <SelectItem
                    className={"px-5 cursor-pointer h-10"}
                    value="without_permissions"
                  >
                    Without Permissions
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Bulk actions bar */}
        {isSuperadmin && selectedUsers.length > 0 && (
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
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete ({selectedUsers.length})
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
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto rounded-[15px] border border-gray-100 dark:border-white/10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-white backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  {isSuperadmin && (
                    <th className="px-5 py-4 text-left w-12">
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
                      />
                    </th>
                  )}
                  <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-black uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-black uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-black uppercase tracking-wider">
                    Email Verification
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
                      colSpan={isSuperadmin ? 6 : 5}
                      className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-black"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem) => (
                    <tr
                      key={userItem.id || userItem._id}
                      className={cn(
                        "bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
                        selectedUsers.includes(getUserId(userItem)) &&
                          "bg-red-50/60 dark:bg-red-500/5",
                      )}
                    >
                      {isSuperadmin && (
                        <td className="px-5 py-3 w-12">
                          {isSelectable(userItem) ? (
                            <Checkbox
                              checked={selectedUsers.includes(
                                getUserId(userItem),
                              )}
                              onCheckedChange={() =>
                                handleSelectUser(getUserId(userItem))
                              }
                              aria-label={`Select user ${userItem.username}`}
                            />
                          ) : null}
                        </td>
                      )}
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
                        <VerificationBadge verified={userItem.emailVerified} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {getJoinedDate(
                            userItem.id || userItem._id,
                            userItem.createdAt,
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-10 h-10 bg-transparent border-none hover:bg-gray-200 dark:hover:bg-gray-800"
                            >
                              <MoreVertical className="w-4 h-4 icon icon" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-[15px]"
                          >
                            <DropdownMenuItem
                              className="text-black dark:text-white rounded-[15px] hover:bg-gray-100 dark:hover:bg-gray-700 h-12 cursor-pointer px-6"
                              onClick={() =>
                                handleViewDetails(userItem.id || userItem._id)
                              }
                            >
                              <Eye className="w-4 h-4 icon mr-2 icon" />
                              View Details
                            </DropdownMenuItem>
                            {canAssignRoles && (
                              <DropdownMenuItem
                                className="text-black dark:text-white rounded-[15px] hover:bg-gray-100 dark:hover:bg-gray-700 h-12 cursor-pointer px-6"
                                onClick={() => handleEditRole(userItem)}
                              >
                                <Edit className="w-4 h-4 icon mr-2 icon" />
                                Change Role
                              </DropdownMenuItem>
                            )}
                            {canUpdateVerification && (
                              <DropdownMenuItem
                                className="text-black dark:text-white rounded-[15px] hover:bg-gray-100 dark:hover:bg-gray-700 h-12 cursor-pointer px-6"
                                onClick={() => handleEditVerification(userItem)}
                              >
                                <Mail className="w-4 h-4 icon mr-2 icon" />
                                Update Verification
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-black dark:text-white rounded-[15px] hover:bg-gray-100 dark:hover:bg-gray-700 h-12 cursor-pointer px-6"
                              onClick={() =>
                                (window.location.href = `/dashboard/admin/permissions?userId=${userItem.id || userItem._id}`)
                              }
                            >
                              <Shield className="w-4 h-4 icon mr-2 icon" />
                              Edit Permissions
                            </DropdownMenuItem>
                            {isSuperadmin && userItem.role !== "superadmin" && (
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer h-10 px-6"
                                onClick={() =>
                                  handleDeleteUser(userItem.id || userItem._id)
                                }
                              >
                                <Trash2 className="w-4 h-4 icon mr-2 icon" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[18px] p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PiUserPlusDuotone className="w-5 h-5 text-theme" />
                Create New User
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateUser(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <Input
                  value={createUserForm.username}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      username: e.target.value,
                    })
                  }
                  required
                  className="bg-white dark:bg-white/5 rounded-[12px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      email: e.target.value,
                    })
                  }
                  required
                  className="bg-white dark:bg-white/5 rounded-[12px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      password: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                  className="bg-white dark:bg-white/5 rounded-[12px]"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-[12px] w-[150px]"
                  onClick={() => setShowCreateUser(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingUser}
                  className="bg-theme hover:bg-theme text-white rounded-[12px] w-[150px]"
                >
                  {creatingUser ? "Creating..." : "Create User"}
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
            className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[18px] p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 truncate dark:text-white line-clamp-1 flex items-center gap-2">
                <Shield className="w-5 h-5 text-theme" />
                Change Role · {selectedUserForRole.username}
              </h2>
              <Button
                variant="ghost"
                className={"w-10 h-10"}
                size="sm"
                onClick={() => setShowRoleModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Role
                </label>
                <Select
                  value={newRole || selectedUserForRole.role}
                  onValueChange={setNewRole}
                >
                  <SelectTrigger className="bg-white dark:bg-white/5 rounded-[12px]">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className={"px-5"} value="user">
                      User
                    </SelectItem>
                    <SelectItem className={"px-5"} value="admin">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  className="rounded-[12px]"
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignRole}
                  className="bg-theme hover:bg-theme text-white rounded-[12px]"
                >
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
            className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[18px] p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 truncate dark:text-white line-clamp-1 flex items-center gap-2">
                <Mail className="w-5 h-5 text-theme flex-shrink-0" />
                Update Verification · {selectedUserForVerification.username}
              </h2>
              <Button
                variant="ghost"
                className={"w-10 h-10"}
                size="sm"
                onClick={() => setShowVerificationModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Verification Status
                </label>
                <Select
                  value={newVerificationValue ? "true" : "false"}
                  onValueChange={(value) =>
                    setNewVerificationValue(value === "true")
                  }
                >
                  <SelectTrigger className="bg-white dark:bg-white/5 rounded-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className={"px-5"} value="true">
                      Verified
                    </SelectItem>
                    <SelectItem className={"px-5"} value="false">
                      Pending
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  className="rounded-[12px]"
                  onClick={() => setShowVerificationModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateVerification}
                  className="bg-theme hover:bg-theme text-white rounded-[12px]"
                >
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
