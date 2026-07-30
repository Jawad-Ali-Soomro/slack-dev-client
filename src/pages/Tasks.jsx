import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import HorizontalLoader from "../components/HorizontalLoader";
import { usePermissions } from "../hooks/usePermissions";
import {
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  FolderOpen,
  FolderGit2,
  ArrowRight,
  ListTodo,
  Target,
} from "lucide-react";
import { connectGithub } from "@/hooks/useGithubRepos";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import taskService from "../services/taskService";
import { userService } from "../services/userService";
import projectService from "../services/projectService";
import teamService from "../services/teamService";
import friendService from "../services/friendService";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { getAvatarProps } from "../utils/avatarUtils";
import TaskEditModal from "../components/TaskEditModal";
import CreateTaskModal from "../components/CreateTaskModal";
import UserDetailsModal from "../components/UserDetailsModal";
import {
  getButtonClasses,
  getInputClasses,
  COLOR_THEME,
  ICON_SIZES,
} from "../utils/uiConstants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { cn } from "../lib/utils";
import { PiPlus } from "react-icons/pi";

const Tasks = () => {
  const { user } = useAuth();
  const { markAsReadByType } = useNotifications();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewTaskPopup, setShowNewTaskPopup] = useState(false);
  const [modalRepository, setModalRepository] = useState(null);
  const [modalDueDate, setModalDueDate] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const relatedTasks = useMemo(() => {
    if (!selectedTaskDetails?.project) return [];
    const projectId =
      selectedTaskDetails.project.id || selectedTaskDetails.project._id;
    if (!projectId) return [];

    return tasks
      .filter((task) => {
        const currentProjectId = task.project?.id || task.project?._id;
        const taskId = task.id || task._id;
        const selectedId = selectedTaskDetails.id || selectedTaskDetails._id;
        return currentProjectId === projectId && taskId !== selectedId;
      })
      .slice(0, 6);
  }, [selectedTaskDetails, tasks]);

  const handleUserAvatarClick = (userId) => {
    setSelectedUserId(userId);
    setShowUserDetails(true);
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTaskDetails(task);
    setIsTaskSheetOpen(true);
  };

  const handleCloseTaskDetails = () => {
    setIsTaskSheetOpen(false);
    setSelectedTaskDetails(null);
  };

  const handleRelatedTaskClick = (task) => {
    if (!task) return;
    handleViewTaskDetails(task);
  };

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        priority: filterPriority !== "all" ? filterPriority : undefined,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await taskService.getTasks(filters);
      const allTasks = response.tasks || [];

      const authorizedTasks = allTasks.filter((task) => {
        if (!user || !user.id) return false;

        return task.assignTo?.id === user.id || task.assignedBy?.id === user.id;
      });

      setTasks(authorizedTasks);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error(error.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, pagination.page, pagination.limit, user]);

  useEffect(() => {
    if (user && user.id) {
      loadTasks();
    }
  }, [filterStatus, filterPriority, user]);

  useEffect(() => {
    if (user && user.id) {
      markAsReadByType("tasks");
    }
  }, [user, markAsReadByType]);

  useEffect(() => {
    const { openModal, date, repoId, name } = location.state || {};
    if (!openModal && !repoId) return;

    if (date) {
      const parsed = new Date(date);
      if (!Number.isNaN(parsed.getTime())) {
        setModalDueDate(parsed.toISOString().split("T")[0]);
      }
    } else {
      setModalDueDate("");
    }

    if (repoId && name) {
      setModalRepository({ repoId: String(repoId), repoName: name });
    } else {
      setModalRepository(null);
    }

    setShowNewTaskPopup(true);
  }, [location.state]);

  const loadUsers = async () => {
    try {
      const response = await friendService.getFriends();
      const friends = response.friends || [];

      const transformedUsers = friends
        .map((friendship) => ({
          id: friendship.friend.id,
          name: friendship.friend.username,
          username: friendship.friend.username,
          email: friendship.friend.email,
          avatar:
            friendship.friend.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(friendship.friend.username)}&background=random&color=fff&size=128`,
        }))
        .filter((friend) => friend.id !== user?.id); // Exclude current user

      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error loading friends:", error);
      toast.error("Failed to load friends");
      setUsers([]);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectService.getProjects({ limit: 100 });
      setProjects(response.projects || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
      setProjects([]);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await teamService.getTeams({ limit: 100 });
      setTeams(response.teams || []);
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadProjects();
    loadTeams();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.assignTo &&
        task.assignTo.username &&
        task.assignTo.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((task) => task.id));
    }
  };

  const handleSelectTask = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) {
      toast.error("No tasks selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedTasks.length} task(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const results = await Promise.allSettled(
        selectedTasks.map((id) => taskService.deleteTask(id)),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const deleted = selectedTasks.length - failed;

      setSelectedTasks([]);
      await loadTasks();
      window.dispatchEvent(new CustomEvent("tasks:changed"));

      if (deleted > 0)
        toast.success(`${deleted} task(s) deleted successfully!`);
      if (failed > 0) toast.error(`${failed} task(s) could not be deleted.`);
    } catch (error) {
      console.error("Error deleting tasks:", error);
      toast.error(error.message || "Failed to delete tasks");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-dark dark:border-transparent dark:text-black bg-red-100 border border-red-500 px-4 py-2 min-w-[80px]";
      case "medium":
        return "text-dark dark:border-transparent dark:text-black bg-yellow-100 border border-yellow-500 px-4 py-2 min-w-[80px]";
      case "low":
        return "text-dark dark:border-transparent dark:text-black bg-green-100 border border-green-500 px-4 py-2 min-w-[80px]";
      default:
        return "text-dark dark:border-transparent dark:text-black bg-green-100 border border-green-500 px-4 py-2 min-w-[80px]";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-black dark:text-black font-bold dark:text-white bg-green-500/15 text-black dark:text-black border border-green-400/40 px-4 py-2 min-w-[100px]";
      case "in_progress":
        return "text-black dark:text-black font-bold dark:text-white bg-gray-500/15 text-gray-600 border border-gray-400/40 px-4 py-2 min-w-[100px]";
      case "pending":
        return "text-black dark:text-black font-bold dark:text-white bg-yellow-500/15 text-yellow-600 border border-yellow-400/40 px-4 py-2 min-w-[100px]";
      case "cancelled":
        return "text-black dark:text-black font-bold dark:text-white bg-red-500/15 text-red-600 border border-red-400/40 px-4 py-2 min-w-[100px]";
      default:
        return "text-black dark:text-black font-bold dark:text-white bg-yellow-500/15 text-yellow-600 border border-yellow-400/40 px-4 py-2 min-w-[100px]";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 icon icon" />;
      case "in_progress":
        return <Clock className="w-4 h-4 icon icon" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 icon icon" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 icon icon" />;
      default:
        return <Clock className="w-4 h-4 icon icon" />;
    }
  };

  const formatLabel = (value) => {
    if (!value) return "N/A";
    return value
      .toString()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/15 text-black dark:text-black border border-emerald-400/40";
      case "in_progress":
        return "bg-gray-500/15 text-black dark:text-black border border-gray-400/40";
      case "pending":
        return "bg-amber-500/15 text-amber-600 border border-amber-400/40";
      case "cancelled":
        return "bg-red-500/15 text-red-600 border border-red-400/40";
      case "overdue":
        return "bg-red-500 text-red-600 border border-red-400/40";
      default:
        return "bg-gray-500/15 text-gray-600 border border-gray-400/40";
    }
  };

  const getPriorityBadgeStyles = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/15 text-red-600 border border-red-400/40";
      case "medium":
        return "bg-orange-500/15 text-orange-600 border border-orange-400/40";
      case "low":
        return "bg-green-500/15 text-green-600 border border-green-400/40";
      default:
        return "bg-green-500/15 text-green-600 border border-green-400/40";
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setLoading(true);
      await taskService.deleteTask(id);
      await loadTasks();
      window.dispatchEvent(new CustomEvent("tasks:changed"));
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      await taskService.updateTaskStatus(taskId, newStatus);
      await loadTasks(); // Reload tasks after status change
      toast.success("Task status updated successfully!");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error(error.message || "Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    );
    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  document.title = "Tasks - Schedule & Manage";

  const isTaskOverdue = (task) => {
    if (!task.dueDate) return false; // No due date
    if (task.status === "in_progress" || task.status === "cancelled")
      return false;

    const now = new Date();
    const dueDate = new Date(task.dueDate);

    return dueDate < now;
  };

  return (
    <div className="overflow-hidden pt-10">
      <motion.div
        className="mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex py-6 gap-3 items-center fixed z-10 md:-top-3 -top-30 z-10">
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[15px]">
            <div className="flex p-3 bg-white dark:bg-gray-800 rounded-[15px]">
              <CheckCircle size={15} />
            </div>
            <h1 className="text-2xl font-bold">Tasks Assigned</h1>
          </div>
        </div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.div variants={itemVariants}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative max-w-3xl dark:bg-[black]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 icon" />
                    <Input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={getInputClasses(
                        "default",
                        "md",
                        "w-full pl-10 md:w-[500px] pr-4 h-13 dark:bg-[black]",
                      )}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="md:w-[180px] w-1/2 px-5 h-13 h-13 cursor-pointer dark:text-white bg-white dark:bg-black">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[black] ">
                        <SelectItem
                          className={"h-10 cursor-pointer px-5"}
                          value="all"
                        >
                          All Status
                        </SelectItem>
                        <SelectItem
                          className={"h-10 cursor-pointer px-5"}
                          value="pending"
                        >
                          Pending
                        </SelectItem>
                        <SelectItem
                          className={"h-10 cursor-pointer px-5"}
                          value="in_progress"
                        >
                          In Progress
                        </SelectItem>
                        <SelectItem
                          className={"h-10 cursor-pointer px-5"}
                          value="completed"
                        >
                          Completed
                        </SelectItem>
                        <SelectItem
                          className={"h-10 cursor-pointer px-5"}
                          value="cancelled"
                        >
                          Cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filterPriority}
                      onValueChange={setFilterPriority}
                    >
                      <SelectTrigger className="md:w-[180px] w-1/2 px-5 h-13 bg-white dark:bg-transparent cursor-pointer dark:text-white">
                        <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[black]">
                        <SelectItem
                          className={"h-10 cursor-pointer px-5"}
                          value="all"
                        >
                          All Priority
                        </SelectItem>
                        <SelectItem
                          className={"h-10 cursor-pointer px-5"}
                          value="high"
                        >
                          High
                        </SelectItem>
                        <SelectItem
                          className={"h-10 cursor-pointer px-5"}
                          value="medium"
                        >
                          Medium
                        </SelectItem>
                        <SelectItem
                          className={"h-10 cursor-pointer px-5"}
                          value="low"
                        >
                          Low
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="flex items-center gap-3">
              {selectedTasks.length > 0 && (
                <motion.button
                  onClick={handleBulkDelete}
                  className="flex items-center h-12 flex items-center justify-center font-bold gap-2 px-4 py-2 bg-red-600 text-white rounded-[15px] md:w-[200px] w-[400px] hover:bg-red-700 transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Trash2 className="w-4 h-4 icon icon" />
                  Delete ({selectedTasks.length})
                </motion.button>
              )}
              {permissions.canCreateTask && (
                <Button
                  onClick={() => {
                    if (!permissions.canCreateTask) {
                      toast.error(
                        "You do not have permission to create tasks. Contact an admin.",
                      );
                      return;
                    }
                    setModalRepository(null);
                    setModalDueDate("");
                    setShowNewTaskPopup(true);
                  }}
                  className={
                    "md:w-[200px] w-full rounded-[15px] h-12 font-bold"
                  }
                >
                  <PiPlus />
                  Schedule Task
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}

        {/* Tasks Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-transparent rounded-[15px] shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 rounded-[15px]">
            <table className="w-full">
              <thead className="bg-white dark:bg-white dark:text-black text-black border-b dark:border-gray-700 sticky top-0 z-10">
                <tr className="bg-white">
                  <th className="pl-6 py-4 text-left w-12">
                    <Checkbox
                      checked={
                        filteredTasks.length === 0
                          ? false
                          : selectedTasks.length === filteredTasks.length
                            ? true
                            : selectedTasks.length > 0
                              ? "indeterminate"
                              : false
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all tasks"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black uppercase tracking-wider">
                    Assigned BY
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black uppercase tracking-wider">
                    Repository
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center">
                      <HorizontalLoader
                        message="Loading tasks..."
                        subMessage="Fetching your task list"
                        progress={60}
                        className="py-4"
                      />
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <motion.tr
                      key={task.id}
                      className={`hover:bg-gray-50 dark:hover:bg-transparent dark:hover:text-black dark:bg-black transition-colors ${selectedTasks.includes(task.id) ? "bg-gray-100 dark:bg-transparent" : ""}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td
                        className="pl-6 py-4 w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => handleSelectTask(task.id)}
                          aria-label={`Select task ${task.title}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-2 dark:text-white truncate">
                              {getStatusIcon(task.status)}
                              {task.title}
                            </div>
                            {/* {user && user.id && (
                            <span className={`text-xs px-2 py-1 rounded-[15px] uppercase  truncate ${
                              task.assignTo?.id === user.id 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {task.assignTo?.id === user.id ? 'to me' : 'by me'}
                            </span>
                          )} */}
                          </div>
                          {/* <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {task.description}
                        </div> */}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center uppercase px-2.5 py-0.5 rounded-[15px] text-[9px]   ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex items-center gap-1 font-bold rounded-[15px] text-[9px] uppercase cursor-pointer hover:opacity-80 transition-opacity px-4 py-2 min-w-[100px]
    ${isTaskOverdue(task) ? "bg-red-500/15 text-red-600 border border-red-400/40" : getStatusColor(task.status)}`}
                            >
                              {isTaskOverdue(task) ? (
                                <AlertCircle className="w-4 h-4 icon icon" />
                              ) : (
                                getStatusIcon(task.status)
                              )}
                              {isTaskOverdue(task)
                                ? "Overdue"
                                : task.status === "in_progress"
                                  ? "Progress"
                                  : formatLabel(task.status)}
                            </button>
                          </DropdownMenuTrigger>
                          {!isTaskOverdue(task) && (
                            <DropdownMenuContent
                              align="start"
                              className="border-gray-200 dark:border-gray-700"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(task.id, "pending")
                                }
                                className="px-5 h-10 cursor-pointer"
                              >
                                <AlertCircle className="w-4 h-4 icon mr-2 icon" />
                                Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(task.id, "in_progress")
                                }
                                className="px-5 h-10 cursor-pointer"
                              >
                                <Clock className="w-4 h-4 icon mr-2 icon" />
                                In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(task.id, "completed")
                                }
                                className="px-5 h-10 cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4 icon mr-2 icon" />
                                Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(task.id, "cancelled")
                                }
                                className="px-5 h-10 cursor-pointer"
                              >
                                <AlertCircle className="w-4 h-4 icon mr-2 icon" />
                                Cancelled
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          )}
                        </DropdownMenu>
                      </td>
                      <td className="px-6 py-4 w-[150px]">
                        <div className="flex items-center gap-3 w-[150px]">
                          <img
                            {...getAvatarProps(
                              task.assignTo?.avatar,
                              task.assignTo?.username,
                            )}
                            alt={task.assignTo?.username || "User"}
                            className="w-8 h-8 rounded-[15px] object-cover border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                            onClick={() =>
                              task.assignTo?.id &&
                              handleUserAvatarClick(task.assignTo.id)
                            }
                            title={
                              task.assignTo?.username
                                ? `View ${task.assignTo.username}'s profile`
                                : ""
                            }
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {task.assignTo?.username || "Unknown User"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[200px]">
                        <div className="flex items-center gap-3">
                          <img
                            {...getAvatarProps(
                              task.assignedBy?.avatar,
                              task.assignedBy?.username,
                            )}
                            alt={task.assignedBy?.username || "User"}
                            className="w-8 h-8 rounded-[15px] object-cover border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                            onClick={() =>
                              task.assignedBy?.id &&
                              handleUserAvatarClick(task.assignedBy.id)
                            }
                            title={
                              task.assignedBy?.username
                                ? `View ${task.assignedBy.username}'s profile`
                                : ""
                            }
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {task.assignedBy?.username || "Unknown User"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[200px]">
                        {task.project ? (
                          <div className="flex items-center gap-2">
                            {/* {task.project.logo && (
                            <img 
                              src={task.project.logo.startsWith('http') ? task.project.logo : `http://localhost:4000${task.project.logo}`}
                              alt={task.project.name}
                              className="w-6 h-6 rounded object-cover"
                            />
                          )} */}
                            <span className="text-sm text-gray-900 dark:text-white truncate">
                              {task.project.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            No Project
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 w-[200px]">
                        {task.repository?.repoName ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm flex items-center gap-2 text-gray-900 dark:text-white truncate">
                              <FolderGit2 className="w-4 h-4 text-theme shrink-0" />
                              {task.repository.repoName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            No Repository
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 icon text-gray-400 icon" />
                          <span className="text-sm text-gray-900 dark:text-white truncate">
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "No due date"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTaskDetails(task)}
                            className="p-2 text-gray-400 h-10 w-10 hover:text-black dark:hover:text-white"
                            title="View task details"
                          >
                            <Eye className="w-4 h-4 icon icon" />
                          </Button>
                          {user &&
                            user.id &&
                            task.assignedBy?.id === user.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTask(task)}
                                className="p-2 text-gray-400 h-10 w-10 hover:text-black dark:hover:text-white"
                              >
                                <Edit className="w-4 h-4 icon icon" />
                              </Button>
                            )}
                          {user &&
                            user.id &&
                            task.assignedBy?.id === user.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-2 text-gray-400 h-10 w-10 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 icon icon" />
                              </Button>
                            )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <CreateTaskModal
          open={showNewTaskPopup}
          onOpenChange={(open) => {
            setShowNewTaskPopup(open);
            if (!open) {
              setModalRepository(null);
              setModalDueDate("");
            }
          }}
          repository={modalRepository}
          defaultDueDate={modalDueDate}
          onCreated={loadTasks}
        />

        <Sheet
          open={isTaskSheetOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseTaskDetails();
            } else {
              setIsTaskSheetOpen(true);
            }
          }}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-md md:max-w-lg p-0  border-none"
          >
            {selectedTaskDetails ? (
              <div className="flex h-full bg-white dark:bg-gray-900 flex-col">
                <div className="relative overflow-hidden rounded-b-[32px]  text-black dark:text-white px-6 py-7">
                  <div className="absolute inset-0 opacity-20" />
                  <div className="relative flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={cn(
                          "inline-flex items-center gap-2 rounded-[15px] px-3 py-1 text-xs f  ont-medium backdrop-blur-sm border",
                          getStatusBadgeStyles(selectedTaskDetails.status),
                        )}
                      >
                        {getStatusIcon(selectedTaskDetails.status)}
                        <span className="capitalize">
                          {formatLabel(selectedTaskDetails.status)}
                        </span>
                      </Badge>
                      <Badge
                        className={cn(
                          "inline-flex items-center gap-2 rounded-[15px] px-3 py-1 text-xs font-medium backdrop-blur-sm border",
                          getPriorityBadgeStyles(selectedTaskDetails.priority),
                        )}
                      >
                        <AlertCircle className="w-3 h-3 icon" />
                        <span className="capitalize">
                          {formatLabel(selectedTaskDetails.priority)}
                        </span>
                      </Badge>
                      {selectedTaskDetails.project && (
                        <Badge className="inline-flex items-center gap-2 rounded-[15px] px-3 py-1 text-xs font-medium backdrop-blur-sm border border-gray-200 dark:border-gray-700 bg-white/10 text-black dark:text-white ">
                          <FolderOpen className="w-3 h-3 icon" />
                          {selectedTaskDetails.project.name}
                        </Badge>
                      )}
                    </div>
                    <SheetHeader className="space-y-2">
                      <SheetTitle className="text-xl font-semibold text-black dark:text-white leading-8">
                        {selectedTaskDetails.title}
                      </SheetTitle>
                      <p className="text-xs font-semibold line-clamp-2 text-justify text-black/70 dark:text-white/70 leading-6">
                        {selectedTaskDetails.description ||
                          "No description provided for this task."}
                      </p>
                    </SheetHeader>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto text-black dark:text-white px-6  space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 icon text-gray-400 icon" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedTaskDetails.dueDate
                              ? new Date(
                                  selectedTaskDetails.dueDate,
                                ).toLocaleString([], {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "No due date"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-4 h-4 icon text-gray-400 icon" />
                        <div>
                          {/* <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Project</p> */}
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedTaskDetails.project?.name ||
                              "No project linked"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {selectedTaskDetails.repository?.repoName && (
                      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm sm:col-span-2">
                        <div className="flex items-center gap-3">
                          <FolderGit2 className="w-4 h-4 text-theme shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                              GitHub Repository
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedTaskDetails.repository.repoName}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                      <img
                        {...getAvatarProps(
                          selectedTaskDetails.assignTo?.avatar,
                          selectedTaskDetails.assignTo?.username || "User",
                        )}
                        alt={
                          selectedTaskDetails.assignTo?.username ||
                          "User Avatar"
                        }
                        className="w-12 h-12 rounded-[15px] border border-gray-200 dark:border-gray-700"
                      />
                      <div className="truncate">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Assigned To
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {selectedTaskDetails.assignTo?.username ||
                            "Unassigned"}
                        </p>
                        {selectedTaskDetails.assignTo?.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedTaskDetails.assignTo.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                      <img
                        {...getAvatarProps(
                          selectedTaskDetails.assignedBy?.avatar,
                          selectedTaskDetails.assignedBy?.username || "User",
                        )}
                        alt={
                          selectedTaskDetails.assignedBy?.username ||
                          "Assigned By"
                        }
                        className="w-12 h-12 rounded-[15px] border border-gray-200 dark:border-gray-700"
                      />
                      <div>
                        <p className="text-[10px] font-bold  uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Assigned By
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedTaskDetails.assignedBy?.username ||
                            "Unknown"}
                        </p>
                        {selectedTaskDetails.assignedBy?.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedTaskDetails.assignedBy.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {relatedTasks.length > 0 && (
                    <div className="shadow-sm">
                      <div className="space-y-2">
                        {relatedTasks.map((relatedTask) => {
                          const relatedId = relatedTask.id || relatedTask._id;
                          return (
                            <button
                              key={relatedId}
                              type="button"
                              onClick={() =>
                                handleRelatedTaskClick(relatedTask)
                              }
                              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="flex items-center justify-between gap-3 p-3">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                    {relatedTask.title}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-white/70">
                                    Due Date{" "}
                                    <span className="font-bold text-black dark:text-white">
                                      {relatedTask.dueDate
                                        ? new Date(
                                            relatedTask.dueDate,
                                          ).toLocaleDateString()
                                        : "No due date"}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-[15px] px-2.5 py-1 text-[10px] font-medium border backdrop-blur-sm",
                                      isTaskOverdue(relatedTask)
                                        ? "bg-red-500/15 text-red-600 border border-red-400/40" // Overdue styles
                                        : getStatusBadgeStyles(
                                            relatedTask.status || "pending",
                                          ), // Normal status styles
                                    )}
                                  >
                                    {isTaskOverdue(relatedTask)
                                      ? "Overdue"
                                      : formatLabel(relatedTask.status)}
                                  </Badge>

                                  <ArrowRight className="w-4 h-4 icon text-gray-400 icon" />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Select a task to view details.
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Task Edit Modal */}
        <TaskEditModal
          task={editingTask}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onTaskUpdated={handleTaskUpdated}
          users={users}
        />

        {/* User Details Modal */}
        <UserDetailsModal
          userId={selectedUserId}
          isOpen={showUserDetails}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUserId(null);
          }}
        />
      </motion.div>
    </div>
  );
};

export default Tasks;
