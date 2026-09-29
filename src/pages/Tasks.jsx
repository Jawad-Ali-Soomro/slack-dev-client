import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { m } from "framer-motion";
import HorizontalLoader from "../components/horizontal-loader";
import { usePermissions } from "../hooks/use-permissions";
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
  Kanban,
} from "lucide-react";
import { connectGithub } from "@/hooks/use-github-repos";
import { applyTaskToList, taskIdOf } from "../utils/apply-task-event";
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
import taskService from "../services/task-service";
import { userService } from "../services/user-service";
import projectService from "../services/project-service";
import teamService from "../services/team-service";
import friendService from "../services/friend-service";
import { useAuth } from "../contexts/auth-context";
import { useNotifications } from "../contexts/notification-context";
import UserAvatar from "../components/user-avatar";
import TaskEditModal from "../components/task-edit-modal";
import CreateTaskModal from "../components/create-task-modal";
import TaskCaptureDetails from "../components/task-capture-details";
import TaskStatChips from "../components/task-stat-chips";
import AssignedTaskDrawer from "../components/assigned-task-drawer";
import ReassignTaskButton from "../components/reassign-task-button";
import UserDetailsModal from "../components/user-details-modal";
import {
  getButtonClasses,
  getInputClasses,
  COLOR_THEME,
  ICON_SIZES,
} from "../utils/ui-constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { cn } from "../lib/utils";
import { PiPlus } from "react-icons/pi";
import {
  decodeExtensionMeta,
  hasCaptureMetadata,
} from "../utils/extension-meta";

function getSelectAllCheckedState(filteredTasks, selectedTasks) {
  if (filteredTasks.length === 0) return false;
  if (selectedTasks.length === filteredTasks.length) return true;
  if (selectedTasks.length > 0) return "indeterminate";
  return false;
}

function taskTextOr(value, fallback) {
  return value || fallback;
}

function TasksToolbarActions({
  selectedTasks,
  onBulkDelete,
  canCreateTask,
  onOpenBoard,
  onScheduleTask,
}) {
  return (
    <div className="flex items-center gap-3">
      {selectedTasks.length > 0 && (
        <m.button
          onClick={onBulkDelete}
          className="flex items-center h-12 flex items-center justify-center font-bold gap-2 px-4 py-2 bg-red-600 text-white rounded-[15px] md:w-[200px] w-[400px] hover:bg-red-700 transition-colors"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Trash2 className="w-4 h-4 icon icon" />
          Delete ({selectedTasks.length})
        </m.button>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={onOpenBoard}
        className="rounded-[15px] w-[200px] h-12 font-bold border-gray-200 dark:border-white/10"
      >
        <Kanban className="h-4 w-4" />
        My board
      </Button>
      {canCreateTask && (
        <Button
          onClick={onScheduleTask}
          className={"md:w-[200px] w-full rounded-[15px] h-12 font-bold"}
        >
          <PiPlus />
          Schedule Task
        </Button>
      )}
    </div>
  );
}

function TasksTableBody({
  loading,
  filteredTasks,
  selectedTasks,
  user,
  users,
  onSelectTask,
  onStatusChange,
  onViewDetails,
  onEditTask,
  onDeleteTask,
  onUserAvatarClick,
  onTaskUpdated,
  canReassignTask,
  getStatusIcon,
  getPriorityColor,
  getStatusColor,
  isTaskOverdue,
  formatLabel,
}) {
  if (loading) {
    return (
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
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <tr>
        <td
          colSpan="10"
          className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
        >
          No tasks found
        </td>
      </tr>
    );
  }

  return filteredTasks.map((task) => (
    <m.tr
      key={task.id}
      className={`hover:bg-gray-50 dark:hover:bg-transparent dark:hover:text-black dark:bg-black transition-colors ${selectedTasks.includes(task.id) ? "bg-gray-100 dark:bg-transparent" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <td className="pl-6 py-4 w-12" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selectedTasks.includes(task.id)}
          onCheckedChange={() => onSelectTask(task.id)}
          aria-label={`Select task ${task.title}`}
        />
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-900 flex items-center gap-2 dark:text-white truncate">
              {getStatusIcon(task.status)}
              {task.title.length > 20
                ? task.title.slice(0, 20) + "..."
                : task.title}
            </div>
          </div>
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
        {isTaskOverdue(task) ? (
          <span
            className="inline-flex items-center gap-1 font-bold rounded-[15px] text-[9px] uppercase px-4 py-2 min-w-[100px] bg-red-500 text-white"
          >
            <AlertCircle className="w-4 h-4 icon icon" />
            Overdue
          </span>
        ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`inline-flex items-center gap-1 font-bold rounded-[15px] text-[9px] uppercase cursor-pointer hover:opacity-80 transition-opacity px-4 py-2 min-w-[100px]
    ${getStatusColor(task.status)}`}
            >
              {getStatusIcon(task.status)}
              {task.status === "in_progress"
                ? "Progress"
                : formatLabel(task.status)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="border-gray-200 dark:border-gray-700"
          >
            <DropdownMenuItem
              onSelect={() => onStatusChange(task.id || task._id, "pending")}
              className="px-5 h-10 cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 icon mr-2 icon" />
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onStatusChange(task.id || task._id, "in_progress")}
              className="px-5 h-10 cursor-pointer"
            >
              <Clock className="w-4 h-4 icon mr-2 icon" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onStatusChange(task.id || task._id, "completed")}
              className="px-5 h-10 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 icon mr-2 icon" />
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onStatusChange(task.id || task._id, "cancelled")}
              className="px-5 h-10 cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 icon mr-2 icon" />
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}
      </td>
      <td className="px-6 py-4 w-[150px]">
        <div className="flex items-center gap-3 w-[150px]">
          <UserAvatar
            user={task.assignTo}
            size="md"
            onClick={(id) => id && onUserAvatarClick(id)}
          />
          <div>
            <div className="text-sm text-gray-900 dark:text-white truncate">
              {taskTextOr(task.assignTo?.username, "Unknown User")}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 w-[200px]">
        <div className="flex items-center gap-3">
          <UserAvatar
            user={task.assignedBy}
            size="md"
            onClick={(id) => id && onUserAvatarClick(id)}
          />
          <div>
            <div className="text-sm text-gray-900 dark:text-white truncate">
              {taskTextOr(task.assignedBy?.username, "Unknown User")}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 w-[200px]">
        {task.project ? (
          <div className="flex items-center gap-2">
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
            onClick={() => onViewDetails(task)}
            className="p-2 text-gray-400 h-10 w-10 hover:text-black dark:hover:text-white"
            title="View task details"
          >
            <Eye className="w-4 h-4 icon icon" />
          </Button>
          {canReassignTask(task) && (
            <ReassignTaskButton
              task={task}
              users={users}
              currentUserId={user.id}
              onReassigned={onTaskUpdated}
            />
          )}
          {user && user.id && task.assignedBy?.id === user.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditTask(task)}
              className="p-2 text-gray-400 h-10 w-10 hover:text-black dark:hover:text-white"
            >
              <Edit className="w-4 h-4 icon icon" />
            </Button>
          )}
          {user && user.id && task.assignedBy?.id === user.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteTask(task.id)}
              className="p-2 text-gray-400 h-10 w-10 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4 icon icon" />
            </Button>
          )}
        </div>
      </td>
    </m.tr>
  ));
}

function TaskDetailsHeader({
  task,
  getStatusBadgeStyles,
  getPriorityBadgeStyles,
  getStatusIcon,
  formatLabel,
}) {
  return (
    <div className="relative overflow-hidden rounded-b-[32px]  text-black dark:text-white px-6 py-7">
      <div className="absolute inset-0 opacity-20" />
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              "inline-flex items-center gap-2 rounded-[15px] px-3 py-1 text-xs f  ont-medium backdrop-blur-sm border",
              getStatusBadgeStyles(task.status),
            )}
          >
            {getStatusIcon(task.status)}
            <span className="capitalize">{formatLabel(task.status)}</span>
          </Badge>
          <Badge
            className={cn(
              "inline-flex items-center gap-2 rounded-[15px] px-3 py-1 text-xs font-medium backdrop-blur-sm border",
              getPriorityBadgeStyles(task.priority),
            )}
          >
            <AlertCircle className="w-3 h-3 icon" />
            <span className="capitalize">{formatLabel(task.priority)}</span>
          </Badge>
          {task.project && (
            <Badge className="inline-flex items-center gap-2 rounded-[15px] px-3 py-1 text-xs font-medium border border-transparent bg-[#FF914B] text-black">
              <FolderOpen className="w-3 h-3 icon" />
              {task.project.name}
            </Badge>
          )}
        </div>
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-xl font-semibold text-black dark:text-white leading-8">
            {task.title}
          </SheetTitle>
          <p className="text-xs font-semibold line-clamp-2 text-justify text-muted-foreground leading-6">
            {taskTextOr(
              task.description,
              "No description provided for this task.",
            )}
          </p>
        </SheetHeader>
      </div>
    </div>
  );
}

function TaskDetailsMeta({ task }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 icon text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {task.dueDate
                ? new Date(task.dueDate).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
                : "No due date"}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-4 h-4 icon text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {taskTextOr(task.project?.name, "No project linked")}
            </p>
          </div>
        </div>
      </div>
      {task.repository?.repoName && (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm sm:col-span-2">
          <div className="flex items-center gap-3">
            <FolderGit2 className="w-4 h-4 text-theme shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                GitHub Repository
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {task.repository.repoName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskDetailsAssignees({ task, onUserAvatarClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
        <UserAvatar
          user={task.assignTo}
          size="xl"
          onClick={(id) => id && onUserAvatarClick(id)}
        />
        <div className="truncate">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Assigned To
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {taskTextOr(task.assignTo?.username, "Unassigned")}
          </p>
          {task.assignTo?.email && (
            <p className="text-xs text-muted-foreground">
              {task.assignTo.email}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
        <UserAvatar
          user={task.assignedBy}
          size="xl"
          onClick={(id) => id && onUserAvatarClick(id)}
        />
        <div>
          <p className="text-[10px] font-bold  uppercase tracking-wide text-muted-foreground">
            Assigned By
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {taskTextOr(task.assignedBy?.username, "Unknown")}
          </p>
          {task.assignedBy?.email && (
            <p className="text-xs text-muted-foreground">
              {task.assignedBy.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskDetailsRelated({
  relatedTasks,
  onRelatedTaskClick,
  isTaskOverdue,
  getStatusBadgeStyles,
  formatLabel,
}) {
  if (relatedTasks.length === 0) return null;

  return (
    <div className="shadow-sm">
      <div className="space-y-2">
        {relatedTasks.map((relatedTask) => {
          const relatedId = relatedTask.id || relatedTask._id;
          return (
            <button
              key={relatedId}
              type="button"
              onClick={() => onRelatedTaskClick(relatedTask)}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {relatedTask.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Due Date{" "}
                    <span className="font-bold text-black dark:text-white">
                      {relatedTask.dueDate
                        ? new Date(relatedTask.dueDate).toLocaleDateString()
                        : "No due date"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "inline-flex items-center gap-1 rounded-[15px] px-2.5 py-1 text-[10px] font-medium border backdrop-blur-sm",
                      isTaskOverdue(relatedTask)
                        ? "bg-red-500/15 text-red-600 border border-red-400/40 dark:border-transparent dark:bg-red-500 dark:text-white"
                        : getStatusBadgeStyles(
                          relatedTask.status || "pending",
                        ),
                    )}
                  >
                    {isTaskOverdue(relatedTask)
                      ? "Overdue"
                      : formatLabel(relatedTask.status)}
                  </Badge>

                  <ArrowRight className="w-4 h-4 icon text-muted-foreground" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskDetailsPanel({
  task,
  relatedTasks,
  onUserAvatarClick,
  onRelatedTaskClick,
  getStatusBadgeStyles,
  getPriorityBadgeStyles,
  getStatusIcon,
  formatLabel,
  isTaskOverdue,
}) {
  return (
    <div className="flex h-full bg-white dark:bg-zinc-900 flex-col">
      <TaskDetailsHeader
        task={task}
        getStatusBadgeStyles={getStatusBadgeStyles}
        getPriorityBadgeStyles={getPriorityBadgeStyles}
        getStatusIcon={getStatusIcon}
        formatLabel={formatLabel}
      />

      <div className="flex-1 overflow-y-auto text-black dark:text-white px-6  space-y-6">
        <TaskDetailsMeta task={task} />
        <TaskDetailsAssignees
          task={task}
          onUserAvatarClick={onUserAvatarClick}
        />
        <TaskCaptureDetails captureMetadata={task.captureMetadata} />
        <TaskDetailsRelated
          relatedTasks={relatedTasks}
          onRelatedTaskClick={onRelatedTaskClick}
          isTaskOverdue={isTaskOverdue}
          getStatusBadgeStyles={getStatusBadgeStyles}
          formatLabel={formatLabel}
        />
      </div>
    </div>
  );
}

const Tasks = () => {
  const { user } = useAuth();
  const { markAsReadByType } = useNotifications();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewTaskPopup, setShowNewTaskPopup] = useState(false);
  const [modalRepository, setModalRepository] = useState(null);
  const [modalDueDate, setModalDueDate] = useState("");
  const [modalCaptureMetadata, setModalCaptureMetadata] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    cancelledTasks: 0,
    completionRate: 0,
  });
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

  const userIdOf = (person) => person?.id || person?._id || "";
  const isMine = (task, userId) =>
    userIdOf(task?.assignTo) === userId || userIdOf(task?.assignedBy) === userId;
  const canReassignTask = (task) =>
    !!user?.id && userIdOf(task?.assignedBy) === user.id;

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

  const loadTaskStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const stats = await taskService.getTaskStats();
      setTaskStats({
        totalTasks: Number(stats?.totalTasks) || 0,
        pendingTasks: Number(stats?.pendingTasks) || 0,
        completedTasks: Number(stats?.completedTasks) || 0,
        cancelledTasks: Number(stats?.cancelledTasks) || 0,
        completionRate: Number(stats?.completionRate) || 0,
      });
    } catch (error) {
      console.error("Error loading task stats:", error);
    }
  }, [user?.id]);

  const isTaskOverdue = useCallback((task) => {
    if (!task?.dueDate) return false;
    if (task.status === "completed" || task.status === "cancelled") return false;
    return new Date(task.dueDate) < new Date();
  }, []);

  // Always derive live chip numbers from the tasks currently shown
  const liveStats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const cancelled = tasks.filter((t) => t.status === "cancelled").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const total = tasks.length;
    return {
      totalTasks: total,
      pendingTasks: pending,
      completedTasks: completed,
      cancelledTasks: cancelled,
      inProgressTasks: inProgress,
      completionRate:
        total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0,
    };
  }, [tasks]);

  // Prefer live table counts when viewing unfiltered list; otherwise API
  const chipStats = useMemo(() => {
    const viewingAll = filterStatus === "all" && filterPriority === "all";
    if (viewingAll && tasks.length > 0) return liveStats;

    const apiHasData =
      taskStats.totalTasks > 0 ||
      taskStats.pendingTasks > 0 ||
      taskStats.completedTasks > 0 ||
      taskStats.cancelledTasks > 0;

    return apiHasData ? taskStats : liveStats;
  }, [filterStatus, filterPriority, tasks.length, liveStats, taskStats]);

  // Daily activity for barcode + streak (last 56 days)
  const activitySeries = useMemo(() => {
    const days = 56;
    const counts = Array.from({ length: days }, () => 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const task of tasks) {
      const raw = task.updatedAt || task.createdAt || task.dueDate;
      if (!raw) continue;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) continue;
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
      if (diff >= 0 && diff < days) {
        counts[days - 1 - diff] += 1;
      }
    }
    return counts;
  }, [tasks]);

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
      loadTaskStats();
    }
  }, [filterStatus, filterPriority, user]);

  useEffect(() => {
    const onTasksChanged = (event) => {
      const updated = event?.detail;
      const updatedId = taskIdOf(updated);
      if (updatedId) {
        setTasks((prev) =>
          applyTaskToList(prev, updated, {
            include: (task) =>
              isMine(task, user?.id) &&
              (filterStatus === "all" || task.status === filterStatus) &&
              (filterPriority === "all" || task.priority === filterPriority),
          }),
        );
        if (selectedTaskDetails && taskIdOf(selectedTaskDetails) === updatedId) {
          if (updated.deleted) {
            setSelectedTaskDetails(null);
            setIsTaskSheetOpen(false);
          } else {
            setSelectedTaskDetails({ ...selectedTaskDetails, ...updated });
          }
        }
        if (editingTask && taskIdOf(editingTask) === updatedId) {
          if (updated.deleted) {
            setEditingTask(null);
            setShowEditModal(false);
          } else {
            setEditingTask({ ...editingTask, ...updated });
          }
        }
      }
      void loadTaskStats();
    };
    window.addEventListener("tasks:changed", onTasksChanged);
    return () => window.removeEventListener("tasks:changed", onTasksChanged);
  }, [filterPriority, filterStatus, loadTaskStats, user?.id, selectedTaskDetails, editingTask]);

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

  // Chrome extension → open create-task modal with hidden capture metadata
  useEffect(() => {
    const encoded = searchParams.get("meta");
    if (!encoded) return;

    const decoded = decodeExtensionMeta(encoded);
    if (!hasCaptureMetadata(decoded)) return;

    const readShot = () => {
      try {
        const fromWindow = window.__TM_EXT_SCREENSHOT;
        if (typeof fromWindow === "string" && fromWindow.startsWith("data:")) {
          return fromWindow;
        }
      } catch {
        // ignore
      }
      try {
        return sessionStorage.getItem("tm-ext-screenshot");
      } catch {
        return null;
      }
    };

    let nextMeta = { ...decoded };
    const shot = readShot();
    if (shot) {
      nextMeta = { ...nextMeta, screenshot: shot, screenshotPending: false };
    }

    if (decoded.screenshotPending && !nextMeta.screenshot) {
      window.postMessage({ type: "TM_EXT_REQUEST_SCREENSHOT" }, "*");
    }

    setModalCaptureMetadata(nextMeta);
    setModalRepository(null);
    setModalDueDate("");
    setShowNewTaskPopup(true);
  }, [searchParams]);

  // Attach screenshot delivered by the extension (event + short poll)
  useEffect(() => {
    const applyShot = (dataUrl) => {
      if (!dataUrl || typeof dataUrl !== "string") return;
      if (!dataUrl.startsWith("data:")) return;

      setModalCaptureMetadata((prev) =>
        prev
          ? { ...prev, screenshot: dataUrl, screenshotPending: false }
          : { screenshot: dataUrl },
      );

      try {
        sessionStorage.removeItem("tm-ext-screenshot");
      } catch {
        // ignore
      }
      try {
        delete window.__TM_EXT_SCREENSHOT;
      } catch {
        // ignore
      }

      window.postMessage({ type: "TM_EXT_CLEAR_SCREENSHOT" }, "*");
    };

    const onScreenshot = (event) => {
      applyShot(event?.detail?.dataUrl);
    };

    window.addEventListener("tm-ext-screenshot", onScreenshot);

    let tries = 0;
    const poll = window.setInterval(() => {
      tries += 1;
      try {
        const fromWindow = window.__TM_EXT_SCREENSHOT;
        if (typeof fromWindow === "string") {
          applyShot(fromWindow);
          window.clearInterval(poll);
          return;
        }
      } catch {
        // ignore
      }
      try {
        const fromSession = sessionStorage.getItem("tm-ext-screenshot");
        if (fromSession) {
          applyShot(fromSession);
          window.clearInterval(poll);
          return;
        }
      } catch {
        // ignore
      }
      if (tries >= 25) window.clearInterval(poll);
    }, 300);

    return () => {
      window.removeEventListener("tm-ext-screenshot", onScreenshot);
      window.clearInterval(poll);
    };
  }, []);

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
          avatar: friendship.friend.avatar,
          availability: friendship.friend.availability || "available",
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
      await loadTaskStats();
      selectedTasks.forEach((id) => {
        window.dispatchEvent(
          new CustomEvent("tasks:changed", { detail: { id, deleted: true } }),
        );
      });

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
        return "text-black dark:text-black font-bold dark:text-white bg-green-500/15 dark:bg-green-500 dark:border-green-500 text-black dark:text-black border border-green-400/40 px-4 py-2 min-w-[100px]";
      case "in_progress":
        return "text-black dark:text-black font-bold dark:text-white bg-gray-500/15 text-gray-600 border border-gray-400/40 px-4 py-2 min-w-[100px]";
      case "pending":
        return "text-black dark:text-black font-bold dark:text-white bg-yellow-500/15 text-yellow-600 border border-yellow-400/40 px-4 py-2 min-w-[100px]";
      case "cancelled":
        return "text-black dark:text-black font-bold dark:bg-red-500 dark:border-red-500 dark:text-white bg-red-500/15 text-red-600 border border-red-400/40 px-4 py-2 min-w-[100px]";
      default:
        return "text-black dark:text-black font-bold dark:bg-red-500 dark:border-red-500 dark:text-white bg-yellow-500/15 text-yellow-600 border border-yellow-400/40 px-4 py-2 min-w-[100px]";
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
        return "bg-emerald-500/15 text-emerald-700 border border-emerald-400/40 dark:border-transparent dark:bg-green-500 dark:text-white";
      case "in_progress":
        return "bg-sky-500/15 text-sky-700 border border-sky-400/40 dark:border-transparent dark:bg-sky-500 dark:text-white";
      case "pending":
        return "bg-amber-500/15 text-amber-700 border border-amber-400/40 dark:border-transparent dark:bg-amber-500 dark:text-black";
      case "cancelled":
        return "bg-red-500/15 text-red-600 border border-red-400/40 dark:border-transparent dark:bg-red-500 dark:text-white";
      case "overdue":
        return "bg-red-500/15 text-red-600 border border-red-400/40 dark:border-transparent dark:bg-red-500 dark:text-white";
      default:
        return "bg-gray-500/15 text-gray-600 border border-gray-400/40 dark:border-transparent dark:bg-zinc-600 dark:text-white";
    }
  };

  const getPriorityBadgeStyles = (priority) => {
    switch (priority) {
      case "urgent":
      case "high":
        return "bg-red-500/15 text-red-600 border border-red-400/40 dark:border-transparent dark:bg-red-500 dark:text-white";
      case "medium":
        return "bg-orange-500/15 text-orange-600 border border-orange-400/40 dark:border-transparent dark:bg-orange-500 dark:text-black";
      case "low":
        return "bg-green-500/15 text-green-700 border border-green-400/40 dark:border-transparent dark:bg-green-500 dark:text-white";
      default:
        return "bg-green-500/15 text-green-700 border border-green-400/40 dark:border-transparent dark:bg-green-500 dark:text-white";
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setLoading(true);
      await taskService.deleteTask(id);
      await loadTasks();
      await loadTaskStats();
      window.dispatchEvent(
        new CustomEvent("tasks:changed", { detail: { id, deleted: true } }),
      );
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (!taskId) {
      toast.error("Could not update this task");
      return;
    }
    const previous = tasks.find((task) => (task.id || task._id) === taskId);
    if (previous && isTaskOverdue(previous)) return;
    setTasks((prev) =>
      prev.map((task) =>
        (task.id || task._id) === taskId ? { ...task, status: newStatus } : task,
      ),
    );
    try {
      setLoading(true);
      const response = await taskService.updateTaskStatus(taskId, newStatus);
      const updated = response?.task || { ...(previous || {}), id: taskId, status: newStatus };
      setTasks((prev) =>
        prev.map((task) =>
          (task.id || task._id) === taskId ? { ...task, ...updated } : task,
        ),
      );
      window.dispatchEvent(
        new CustomEvent("tasks:changed", { detail: updated }),
      );
      await loadTaskStats();
      toast.success("Task status updated successfully!");
    } catch (error) {
      if (previous) {
        setTasks((prev) =>
          prev.map((task) =>
            (task.id || task._id) === taskId ? previous : task,
          ),
        );
      }
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
    setTasks((prevTasks) => {
      if (!isMine(updatedTask, user?.id)) {
        return prevTasks.filter(
          (task) => (task.id || task._id) !== (updatedTask.id || updatedTask._id),
        );
      }
      return prevTasks.map((task) =>
        (task.id || task._id) === (updatedTask.id || updatedTask._id)
          ? { ...task, ...updatedTask }
          : task,
      );
    });
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

  return (
    <div className="overflow-hidden pt-10">
      <m.div
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

        <m.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <m.div variants={itemVariants}>
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
              </m.div>
            </div>
            <TasksToolbarActions
              selectedTasks={selectedTasks}
              onBulkDelete={handleBulkDelete}
              canCreateTask={permissions.canCreateTask}
              onOpenBoard={() => setIsBoardOpen(true)}
              onScheduleTask={() => {
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
            />
          </div>
        </m.div>

        <m.div variants={itemVariants} className="mb-6">
          <TaskStatChips
            total={chipStats.totalTasks}
            pending={chipStats.pendingTasks}
            ended={chipStats.completedTasks}
            cancelled={chipStats.cancelledTasks}
            completionRate={chipStats.completionRate}
            activitySeries={activitySeries}
            onSelectTotal={() => setFilterStatus("all")}
            onSelectPending={() => setFilterStatus("pending")}
            onSelectEnded={() => setFilterStatus("completed")}
            onSelectCancelled={() => setFilterStatus("cancelled")}
          />
        </m.div>

        {/* Tasks Table */}
        <m.div
          variants={itemVariants}
          className="bg-white dark:bg-transparent rounded-[15px] shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 rounded-[15px]">
            <table className="w-full">
              <thead className="bg-white dark:bg-white dark:text-black text-black border-b dark:border-gray-700 sticky top-0 z-10">
                <tr className="bg-white">
                  <th className="pl-6 py-4 text-left w-12">
                    <Checkbox
                      checked={getSelectAllCheckedState(
                        filteredTasks,
                        selectedTasks,
                      )}
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
                <TasksTableBody
                  loading={loading}
                  filteredTasks={filteredTasks}
                  selectedTasks={selectedTasks}
                  user={user}
                  users={users}
                  onSelectTask={handleSelectTask}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewTaskDetails}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onUserAvatarClick={handleUserAvatarClick}
                  onTaskUpdated={handleTaskUpdated}
                  canReassignTask={canReassignTask}
                  getStatusIcon={getStatusIcon}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  isTaskOverdue={isTaskOverdue}
                  formatLabel={formatLabel}
                />
              </tbody>
            </table>
          </div>
        </m.div>

        <CreateTaskModal
          open={showNewTaskPopup}
          onOpenChange={(open) => {
            setShowNewTaskPopup(open);
            if (!open) {
              setModalRepository(null);
              setModalDueDate("");
              setModalCaptureMetadata(null);
              if (searchParams.has("meta")) {
                const next = new URLSearchParams(searchParams);
                next.delete("meta");
                setSearchParams(next, { replace: true });
              }
            }
          }}
          repository={modalRepository}
          defaultDueDate={modalDueDate}
          captureMetadata={modalCaptureMetadata}
          onCreated={async () => {
            await loadTasks();
            await loadTaskStats();
          }}
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
            className="w-full sm:max-w-md md:max-w-lg p-0"
          >
            {selectedTaskDetails ? (
              <TaskDetailsPanel
                task={selectedTaskDetails}
                relatedTasks={relatedTasks}
                onUserAvatarClick={handleUserAvatarClick}
                onRelatedTaskClick={handleRelatedTaskClick}
                getStatusBadgeStyles={getStatusBadgeStyles}
                getPriorityBadgeStyles={getPriorityBadgeStyles}
                getStatusIcon={getStatusIcon}
                formatLabel={formatLabel}
                isTaskOverdue={isTaskOverdue}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select a task to view details.
              </div>
            )}
          </SheetContent>
        </Sheet>

        <AssignedTaskDrawer
          open={isBoardOpen}
          onOpenChange={setIsBoardOpen}
          onOpenTask={(task) => {
            setIsBoardOpen(false);
            handleViewTaskDetails(task);
          }}
        />

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
      </m.div>
    </div>
  );
};

export default Tasks;
