import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardSkeleton, {
  GithubReposSkeleton,
} from "../components/dashboard/dashboard-skeleton";
import { usePermissions } from "../hooks/use-permissions";
import ReactECharts from "echarts-for-react";
import {
  CheckCircle,
  Target,
  Video,
  Calendar as CalendarIcon,
  Github,
  MoreHorizontal,
  ChevronRight,
  FolderGit2,
  Folder,
  Clock,
  CircleDot,
  AlertCircle,
  PlusCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import UserDetailsModal from "../components/user-details-modal";
import taskService from "../services/task-service";
import meetingService from "../services/meeting-service";
import projectService from "../services/project-service";
import { toast } from "sonner";
import DashboardStatChips from "../components/dashboard-stat-chips";
import WeeklyBarChart from "../components/dashboard/weekly-bar-chart";
import FeaturedCardsSwiper from "../components/dashboard/featured-cards-swiper";
import { Button } from "@/components/ui/button";
import useGithubRepos, { connectGithub } from "@/hooks/use-github-repos";
import { RiDashboard2Line } from "react-icons/ri";
import CreateTaskModal from "../components/create-task-modal";
import TeamStatus from "../components/dashboard/team-status";
import {
  SortableWidget,
  useDashboardLayout,
  DashboardLayoutReset,
} from "../components/dashboard/dashboard-sortable-grid";

const Dashboard = () => {
  document.title = "Dashboard";
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    tasksThisWeek: 0,
    tasksThisMonth: 0,
    completionRate: 0,

    totalMeetings: 0,
    scheduledMeetings: 0,
    completedMeetings: 0,
    cancelledMeetings: 0,
    pendingMeetings: 0,
    meetingsThisWeek: 0,
    meetingsThisMonth: 0,
    meetingCompletionRate: 0,

    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageProgress: 0,
  });

  const {
    githubData,
    repos: githubReposRaw,
    loading: githubLoading,
    isGithubConnected,
  } = useGithubRepos();
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [taskRepoModal, setTaskRepoModal] = useState(null);
  const { order, sizes, moveWidget, setWidgetSize, resetLayout } =
    useDashboardLayout();

  const handleCreateTaskFromRepo = (repo) => {
    if (!permissions.canCreateTask) {
      toast.error(
        "You do not have permission to create tasks. Contact an admin.",
      );
      return;
    }
    setTaskRepoModal({
      repoId: String(repo.id),
      repoName: repo.name,
    });
  };

  const startOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths = (date, months) =>
    new Date(date.getFullYear(), date.getMonth() + months, 1);
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const getMonthDaysGrid = (monthDate) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = [];

    const leading = (start.getDay() + 6) % 7; // convert to Mon=0 ... Sun=6
    for (let i = 0; i < leading; i++) {
      days.push(null);
    }
    for (let d = 1; d <= end.getDate(); d++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
    }
    return days;
  };

  const getEventsForDate = useCallback(
    (date) => {
      if (!date) return { tasks: [], meetings: [], total: 0 };

      const dateStr = date.toDateString();
      const dayTasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === dateStr;
      });

      const dayMeetings = meetings.filter((meeting) => {
        if (!meeting.startDate) return false;
        const meetingDate = new Date(meeting.startDate);
        return meetingDate.toDateString() === dateStr;
      });

      return {
        tasks: dayTasks,
        meetings: dayMeetings,
        total: dayTasks.length + dayMeetings.length,
      };
    },
    [tasks, meetings],
  );

  const loadDashboardData = useCallback(async () => {
    try {
      // Only show the full-page skeleton on the first load. Tab focus / visibility
      // refreshes must not flip `loading` or the whole dashboard (incl. Team Status)
      // unmounts and remounts.
      if (!hasLoadedOnce.current) {
        setLoading(true);
      }

      const taskResponse = await taskService.getTasks({
        page: 1,
        limit: 100,
      });

      const allTasks = taskResponse.tasks || [];

      const userTasks = allTasks.filter((task) => {
        if (!user || !user.id) return false;
        return task.assignTo?.id === user.id || task.assignedBy?.id === user.id;
      });

      setTasks(userTasks);

      const meetingResponse = await meetingService.getMeetings({
        page: 1,
        limit: 100,
      });

      const allMeetings = meetingResponse.meetings || [];

      // A related party may be returned either as a populated object ({ id/_id })
      // or as a raw id string, so normalize before comparing.
      const matchesUser = (party, userId) => {
        if (!party || !userId) return false;
        const partyId =
          typeof party === "object" ? party.id || party._id : party;
        return String(partyId) === String(userId);
      };

      const userMeetings = allMeetings.filter((meeting) => {
        if (!user || !user.id) return false;
        return (
          matchesUser(meeting.assignedTo, user.id) ||
          matchesUser(meeting.assignedBy, user.id) ||
          (Array.isArray(meeting.attendees) &&
            meeting.attendees.some((attendee) =>
              matchesUser(attendee, user.id),
            ))
        );
      });

      setMeetings(userMeetings);

      const projectResponse = await projectService.getProjects({
        page: 1,
        limit: 100,
      });

      const allProjects = projectResponse.projects || [];
      setProjects(allProjects);

      const projectStatsResponse = await projectService.getProjectStats();
      const projectStats = projectStatsResponse.stats || {};

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const isOverdue = (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "completed";

      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter(
        (task) => task.status === "completed",
      ).length;
      // Buckets are mutually exclusive so the status breakdown sums to the
      // total: an overdue task counts only as "overdue", not also as
      // pending/in_progress.
      const pendingTasks = userTasks.filter(
        (task) => task.status === "pending" && !isOverdue(task),
      ).length;
      const inProgressTasks = userTasks.filter(
        (task) => task.status === "in_progress" && !isOverdue(task),
      ).length;
      const overdueTasks = userTasks.filter((task) => isOverdue(task)).length;

      const tasksThisWeek = userTasks.filter(
        (task) => new Date(task.createdAt) >= oneWeekAgo,
      ).length;

      const tasksThisMonth = userTasks.filter(
        (task) => new Date(task.createdAt) >= oneMonthAgo,
      ).length;

      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const totalMeetings = userMeetings.length;
      const scheduledMeetings = userMeetings.filter(
        (meeting) => meeting.status === "scheduled",
      ).length;
      const completedMeetings = userMeetings.filter(
        (meeting) => meeting.status === "completed",
      ).length;
      const cancelledMeetings = userMeetings.filter(
        (meeting) => meeting.status === "cancelled",
      ).length;
      const pendingMeetings = userMeetings.filter(
        (meeting) => meeting.status === "pending",
      ).length;

      const meetingsThisWeek = userMeetings.filter(
        (meeting) => new Date(meeting.createdAt) >= oneWeekAgo,
      ).length;

      const meetingsThisMonth = userMeetings.filter(
        (meeting) => new Date(meeting.createdAt) >= oneMonthAgo,
      ).length;

      const meetingCompletionRate =
        totalMeetings > 0
          ? Math.round((completedMeetings / totalMeetings) * 100)
          : 0;

      const totalProjects = projectStats.totalProjects || 0;
      const activeProjects = projectStats.activeProjects || 0;
      const completedProjects = projectStats.completedProjects || 0;
      const averageProgress = projectStats.averageProgress || 0;

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        tasksThisWeek,
        tasksThisMonth,
        completionRate,
        totalMeetings,
        scheduledMeetings,
        completedMeetings,
        cancelledMeetings,
        pendingMeetings,
        meetingsThisWeek,
        meetingsThisMonth,
        meetingCompletionRate,
        totalProjects,
        activeProjects,
        completedProjects,
        averageProgress,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
    // Only depends on the user id; status/role changes shouldn't reload the dashboard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (user && user.id) {
      loadDashboardData();
    }
  }, [user?.id, loadDashboardData]);

  // Re-sync dashboard stats when the user returns to this tab/window, or when a
  // task changes elsewhere (e.g. deleted on the Tasks page), so the stats here
  // stay in sync without requiring a full page reload.
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityRefresh = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData();
      }
    };

    const handleDataChanged = () => {
      loadDashboardData();
    };

    window.addEventListener("focus", handleVisibilityRefresh);
    document.addEventListener("visibilitychange", handleVisibilityRefresh);
    window.addEventListener("tasks:changed", handleDataChanged);

    return () => {
      window.removeEventListener("focus", handleVisibilityRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
      window.removeEventListener("tasks:changed", handleDataChanged);
    };
  }, [user?.id, loadDashboardData]);

  const getWeeklyData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      const tasksOnDay = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      }).length;

      const meetingsOnDay = meetings.filter((meeting) => {
        const meetingDate = new Date(meeting.createdAt);
        return meetingDate.toDateString() === date.toDateString();
      }).length;

      const projectsOnDay = projects.filter((project) => {
        const projectDate = new Date(project.createdAt);
        return projectDate.toDateString() === date.toDateString();
      }).length;

      days.push({
        day: dayName,
        Task: tasksOnDay,
        Meeting: meetingsOnDay,
        Project: projectsOnDay,
      });
    }
    return days;
  };

  const weeklyData = getWeeklyData();

  const weeklyMeetingsList = useMemo(() => {
    // Current calendar week (Sunday 00:00 -> Saturday 23:59). We must NOT cap at
    // "now", otherwise meetings scheduled for later today or upcoming days this
    // week (a common case) get wrongly excluded from the count/distribution.
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return meetings.filter((meeting) => {
      const dateValue = meeting.startDate || meeting.createdAt;
      if (!dateValue) return false;
      const date = new Date(dateValue);
      return date >= weekStart && date <= weekEnd;
    });
  }, [meetings]);

  const meetingStatusData = useMemo(
    () => [
      {
        name: "Scheduled",
        value: weeklyMeetingsList.filter((m) => m.status === "scheduled")
          .length,
        color: "#000000",
      },
      {
        name: "Concluded",
        value: weeklyMeetingsList.filter((m) => m.status === "completed")
          .length,
        color: "#75FC96",
      },
      {
        name: "Draft",
        value: weeklyMeetingsList.filter((m) => m.status === "pending").length,
        color: "#ADADAD",
      },
      {
        name: "Cancelled",
        value: weeklyMeetingsList.filter((m) => m.status === "cancelled")
          .length,
        color: "#D13817",
      },
    ],
    [weeklyMeetingsList],
  );

  const meetingStatusOption = useMemo(() => {
    const dayLabels = [];
    const weeklyMeetings = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      dayLabels.push(
        date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      );

      const count = weeklyMeetingsList.filter((meeting) => {
        const meetingDate = new Date(meeting.startDate || meeting.createdAt);
        return meetingDate.toDateString() === date.toDateString();
      }).length;

      weeklyMeetings.push(count);
    }

    const maxValue = Math.max(...weeklyMeetings, 1);

    return {
      grid: {
        left: "3%",
        right: "3%",
        bottom: "8%",
        top: "8%",
        containLabel: true,
      },

      tooltip: {
        trigger: "item",
        formatter: "{c} meetings",
      },

      xAxis: {
        type: "category",
        data: dayLabels,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: "#777",
          fontSize: 12,
        },
      },

      yAxis: {
        type: "value",
        minInterval: 1,
        lineStyle: {
          axisLine: {
            color: "#9CA3AF",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#9CA3AF",
            opacity: 0.3,
            type: "dashed",
          },
        },
      },

      series: [
        {
          type: "bar",
          barWidth: "60%",
          barMaxWidth: 80,

          data: weeklyMeetings.map((value) => ({
            value,
            itemStyle: {
              color: value === maxValue ? "#75FC96" : "#000000",
              borderRadius: 40,
            },
          })),
        },
      ],
    };
  }, [weeklyMeetingsList]);

  const recentTasks = useMemo(() => {
    if (!tasks?.length) return [];
    const sorted = [...tasks].sort((a, b) => {
      const dateA = a.dueDate
        ? new Date(a.dueDate)
        : new Date(a.createdAt || 0);
      const dateB = b.dueDate
        ? new Date(b.dueDate)
        : new Date(b.createdAt || 0);
      return dateA - dateB;
    });
    return sorted.slice(0, 3);
  }, [tasks]);

  const recentMeetings = useMemo(() => {
    if (!meetings?.length) return [];
    const sorted = [...meetings].sort((a, b) => {
      const dateA = a.startDate
        ? new Date(a.startDate)
        : new Date(a.createdAt || 0);
      const dateB = b.startDate
        ? new Date(b.startDate)
        : new Date(b.createdAt || 0);
      return dateA - dateB;
    });
    return sorted.slice(0, 7);
  }, [meetings]);

  const featuredMeeting = useMemo(() => {
    if (!meetings?.length) return null;
    const now = new Date();
    const upcoming = meetings
      .filter((m) => {
        const status = (m.status || "").toLowerCase();
        if (status === "cancelled") return false;
        const end = new Date(m.endDate || m.startDate || 0);
        return !Number.isNaN(end.getTime()) && end >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate || 0).getTime() -
          new Date(b.startDate || 0).getTime(),
      );
    if (upcoming.length) return upcoming[0];
    return recentMeetings[0] || null;
  }, [meetings, recentMeetings]);

  const featuredTask = useMemo(() => {
    if (!tasks?.length) return null;
    const now = new Date();
    const open = tasks.filter((t) => {
      const status = (t.status || "").toLowerCase();
      return status !== "completed" && status !== "cancelled";
    });
    const upcoming = open
      .filter((t) => t.dueDate && !Number.isNaN(new Date(t.dueDate).getTime()))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const dueSoon = upcoming.find((t) => new Date(t.dueDate) >= now);
    if (dueSoon) return dueSoon;
    if (upcoming.length) return upcoming[0];
    if (open.length) {
      return [...open].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      )[0];
    }
    return [...tasks].sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    )[0];
  }, [tasks]);

  const featuredProject = useMemo(() => {
    if (!projects?.length) return null;
    return [...projects].sort((a, b) => {
      const aActive = (a.status || "") === "active" ? 0 : 1;
      const bActive = (b.status || "") === "active" ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return (
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
      );
    })[0];
  }, [projects]);

  const sampleInProgressTask = useMemo(
    () =>
      tasks.find((t) => (t.status || "").toLowerCase() === "in_progress") ||
      null,
    [tasks],
  );

  const sampleCompletedTask = useMemo(
    () =>
      tasks.find((t) => (t.status || "").toLowerCase() === "completed") || null,
    [tasks],
  );

  const taskSegmentPercents = useMemo(() => {
    const total = Math.max(1, stats.totalTasks || 0);
    const done = stats.completedTasks || 0;
    const inProg = stats.inProgressTasks || 0;
    const other = Math.max(0, total - done - inProg);
    return {
      done: Math.round((done / total) * 100),
      inProgress: Math.round((inProg / total) * 100),
      other: Math.round((other / total) * 100),
      doneCount: done,
      inProgressCount: inProg,
      otherCount: other,
    };
  }, [stats.totalTasks, stats.completedTasks, stats.inProgressTasks]);

  const projectSpotlight = useMemo(() => {
    if (!projects?.length) return [];
    return [...projects]
      .sort((a, b) => {
        const aActive = (a.status || "") === "active" ? 0 : 1;
        const bActive = (b.status || "") === "active" ? 0 : 1;
        return aActive - bActive;
      })
      .slice(0, 5)
      .map((project, index) => {
        const pid = String(project.id || project._id || "");
        const related = (tasks || []).filter((t) => {
          const tp =
            t.projectId?.id ||
            t.projectId?._id ||
            t.projectId ||
            t.project?.id ||
            t.project?._id;
          return tp && String(tp) === pid;
        });
        const open = related.filter(
          (t) => (t.status || "").toLowerCase() !== "completed",
        ).length;
        return {
          id: pid || `p-${index}`,
          name: project.name || project.title || "Untitled project",
          openTasks: open || related.length,
          highlight: index === 0,
        };
      });
  }, [projects, tasks]);

  const githubRepos = useMemo(() => {
    return githubReposRaw ?? [];
  }, [githubReposRaw]);

  const displayedRepos = githubRepos.slice(0, 8);
  const hasMoreRepos = githubRepos.length > 6;

  const inProgressCount = useMemo(
    () =>
      tasks.filter((t) => (t.status || "").toLowerCase() === "in_progress")
        .length,
    [tasks],
  );

  const handleTeamUserClick = useCallback((id) => {
    setSelectedUserId(id);
    setShowUserDetails(true);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const quickPills = [
    { label: "System Status", value: "All Systems Active", variant: "theme" },
    {
      label: "Tasks This Week",
      value: `${stats.tasksThisWeek} new`,
      variant: "green",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      variant: "orange",
    },
    {
      label: "Active Projects",
      value: `${stats.activeProjects} running`,
      variant: "neutral",
    },
  ];

  return (
    <div className="dashboard-page min-h-screen pt-6 md:pt-10">
      <div className="mx-auto">
        <div className="mb-8">
            <div className="dashboard-page-header">
            <div className="dashboard-welcome">
              <div className="dashboard-welcome__icon">
                <RiDashboard2Line size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  Welcome back, {user?.username || "Developer"}
                </p>
              </div>
            </div>
            <DashboardLayoutReset onReset={resetLayout} />
          </div>

          {/* Quick stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {quickPills.map((pill) => (
              <div
                key={pill.label}
                className={`dashboard-pill ${pill.variant === "theme" ? "dashboard-pill--theme" : ""}`}
              >
                <div
                  className="dashboard-pill__dot"
                  style={{
                    background:
                      pill.variant === "green"
                        ? "#10b981"
                        : pill.variant === "orange"
                          ? "var(--theme-accent)"
                          : pill.variant === "theme"
                            ? "var(--theme-accent)"
                            : "#6b7280",
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {pill.label}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {pill.value}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        <div className="mb-8">
          <DashboardStatChips
            stats={stats}
            tasks={tasks}
            meetings={meetings}
            projects={projects}
          />
        </div>
        {/* Full-width 12-col board — rows fill edge-to-edge, height hugs content */}
        <div
          data-dashboard-board
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10 items-start"
        >
          <SortableWidget
            id="overview"
            order={order.indexOf("overview")}
            cols={sizes.overview?.cols}
            height={sizes.overview?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="dashboard-card p-5 w-full"
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Project Overview
              </h4>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10">
                This Week
              </span>
            </div>
            <WeeklyBarChart data={weeklyData} height={240} compact />
          </motion.div>
          </SortableWidget>

          <SortableWidget
            id="taskStats"
            order={order.indexOf("taskStats")}
            cols={sizes.taskStats?.cols}
            height={sizes.taskStats?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="dashboard-card p-5 flex flex-col w-full"
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Task Statistics
              </h4>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10">
                Monthly
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Total Tasks: {stats.totalTasks}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#75FC96]/30 text-emerald-800 dark:text-emerald-200">
                {stats.completionRate}% done
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-white/20" />
                Total
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#75FC96]" />
                Done
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                In Progress
              </span>
            </div>

            <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10 mb-5">
              <div
                className="h-full bg-[#75FC96] transition-[width] duration-500"
                style={{ width: `${taskSegmentPercents.done}%` }}
              />
              <div
                className="h-full bg-black dark:bg-white transition-[width] duration-500"
                style={{ width: `${taskSegmentPercents.inProgress}%` }}
              />
              <div
                className="h-full bg-[#ADADAD]/50 transition-[width] duration-500"
                style={{ width: `${taskSegmentPercents.other}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
              <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 p-3.5">
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#75FC96]/25 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                      In Progress
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {sampleInProgressTask?.title ||
                        sampleInProgressTask?.name ||
                        "No active task"}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full bg-[#75FC96]"
                    style={{ width: sampleInProgressTask ? "43%" : "0%" }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {sampleInProgressTask
                    ? `${stats.inProgressTasks} in progress`
                    : "Nothing in progress"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 p-3.5">
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#75FC96]/25 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {sampleCompletedTask?.title ||
                        sampleCompletedTask?.name ||
                        "No completed task"}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full bg-[#75FC96]"
                    style={{ width: sampleCompletedTask ? "100%" : "0%" }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {sampleCompletedTask
                    ? `${stats.completedTasks} completed`
                    : "No completions yet"}
                </p>
              </div>
            </div>
          </motion.div>
          </SortableWidget>

          <SortableWidget
            id="meeting"
            order={order.indexOf("meeting")}
            cols={sizes.meeting?.cols}
            height={sizes.meeting?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <FeaturedCardsSwiper
              className="w-full"
              task={featuredTask}
              meeting={featuredMeeting}
              project={featuredProject}
              onOpenTasks={() => navigate("/dashboard/tasks")}
              onOpenMeetings={() => navigate("/dashboard/meetings")}
              onOpenProjects={() => navigate("/dashboard/projects")}
              onJoinMeeting={(link) => window.open(link, "_blank")}
            />
          </motion.div>
          </SortableWidget>

          <SortableWidget
            id="taskList"
            order={order.indexOf("taskList")}
            cols={sizes.taskList?.cols}
            height={sizes.taskList?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
          <motion.div
            className="dashboard-card p-5 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="dashboard-section-icon !w-8 !h-8 !rounded-lg">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Task List
                </h3>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-gray-300 transition-colors"
                aria-label="More options"
                onClick={() => navigate("/dashboard/tasks")}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            {recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                <Target className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No tasks yet</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentTasks.map((task) => {
                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    task.status !== "completed";
                  const status = (task.status || "").toLowerCase();
                  const StatusIcon =
                    status === "completed"
                      ? CheckCircle
                      : status === "in_progress"
                        ? CircleDot
                        : isOverdue
                          ? AlertCircle
                          : Clock;
                  const statusColor =
                    status === "completed"
                      ? "text-emerald-500"
                      : status === "in_progress"
                        ? "text-blue-500"
                        : isOverdue
                          ? "text-red-500"
                          : "text-amber-500";
                  const progressPct =
                    status === "completed"
                      ? 100
                      : status === "in_progress"
                        ? 55
                        : isOverdue
                          ? 35
                          : 15;
                  return (
                    <li
                      key={task.id || task._id}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-gray-100 dark:border-white/5 bg-[#F8F9FA] dark:bg-white/5 hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => navigate("/dashboard/tasks")}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${status === "completed" ? "bg-emerald-500/10" : status === "in_progress" ? "bg-blue-500/10" : isOverdue ? "bg-red-500/10" : "bg-amber-500/10"}`}
                      >
                        <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {task.title || task.name || "Untitled task"}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <CalendarIcon className="w-3.5 h-3.5 icon" />
                              {new Date(task.dueDate).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          )}
                          <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${status === "completed" ? "bg-[#75FC96]" : isOverdue ? "bg-[#D13817]" : "bg-black dark:bg-white"}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </li>
                  );
                })}
              </ul>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 rounded-lg border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              onClick={() => navigate("/dashboard/tasks")}
            >
              Show details
            </Button>
          </motion.div>
          </SortableWidget>

          <SortableWidget
            id="meetingStatus"
            order={order.indexOf("meetingStatus")}
            cols={sizes.meetingStatus?.cols}
            height={sizes.meetingStatus?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="dashboard-card p-5 w-full"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    Meeting Status
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This week · {weeklyMeetingsList.length} total
                  </p>
                </div>
              </div>
              <div style={{ width: "100%", height: "160px" }}>
                {meetingStatusData.some((item) => item.value > 0) ? (
                  <ReactECharts
                    option={meetingStatusOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                    No meeting data available
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {meetingStatusData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#F8F9FA] dark:bg-white/5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </SortableWidget>

          <SortableWidget
            id="projects"
            order={order.indexOf("projects")}
            cols={sizes.projects?.cols}
            height={sizes.projects?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="dashboard-card p-5 w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  Task Statistics
                </h4>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                  onClick={() => navigate("/dashboard/projects")}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              {projectSpotlight.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  No projects yet
                </p>
              ) : (
                <ul className="space-y-2">
                  {projectSpotlight.map((project, index) => (
                    <li key={project.id}>
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard/projects")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                          project.highlight
                            ? "bg-[#75FC96]/25 dark:bg-[#75FC96]/15"
                            : "hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">
                          {index + 1}
                        </span>
                        <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Folder className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {project.name}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {project.openTasks} task
                            {project.openTasks === 1 ? "" : "s"} due soon
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </SortableWidget>

          <SortableWidget
            id="github"
            order={order.indexOf("github")}
            cols={sizes.github?.cols}
            height={sizes.github?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            {githubLoading ? (
              <GithubReposSkeleton />
            ) : (
              <motion.div
                className="dashboard-card p-5 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex gap-2 items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden border border-gray-200/50 dark:border-white/10">
                      {githubData?.profile?.avatar_url ? (
                        <img
                          className="w-full h-full object-cover"
                          src={githubData.profile.avatar_url}
                          alt={githubData?.profile?.login || "GitHub avatar"}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Github className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {githubData?.profile?.login || "GitHub"}
                    </h2>
                  </div>
                </div>
                {isGithubConnected && githubRepos.length > 0 ? (
                  <>
                    <ul className="space-y-1.5">
                      {displayedRepos.slice(0, 5).map((repo) => (
                        <li key={repo.id ?? repo.full_name ?? repo.name}>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              navigate(`/dashboard/repos/${repo.id}`)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                navigate(`/dashboard/repos/${repo.id}`);
                              }
                            }}
                            className="flex items-center gap-2.5 py-2 w-full px-2.5 relative rounded-lg border border-gray-100 dark:border-white/5 bg-[#F8F9FA] dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group cursor-pointer"
                          >
                            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-200/80 dark:bg-white/10 flex items-center justify-center">
                              <FolderGit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate flex-1 group-hover:text-theme">
                              {repo.name}
                            </p>
                            <button
                              type="button"
                              className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-theme transition-[opacity,color]"
                              title={`Create task for ${repo.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateTaskFromRepo(repo);
                              }}
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                    {hasMoreRepos && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 rounded-lg text-xs border-gray-200 dark:border-white/10"
                        onClick={() => navigate("/dashboard/repos")}
                      >
                        View all ({githubRepos.length})
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 px-2">
                    <Github className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {isGithubConnected
                        ? "No repositories to show."
                        : "Connect GitHub to see repos."}
                    </p>
                    {!isGithubConnected && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={connectGithub}
                        className="rounded-xl w-[200px] bg-black text-white dark:bg-white dark:text-black"
                      >
                        Connect Github
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </SortableWidget>

          <SortableWidget
            id="calendar"
            order={order.indexOf("calendar")}
            cols={sizes.calendar?.cols}
            height={sizes.calendar?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="dashboard-card p-5 w-full"
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="dashboard-section-title">
                <div className="dashboard-section-icon">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Calendar
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    setSelectedDate(today);
                    setCalendarMonth(today);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-[15px] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                  className="p-2 rounded-[15px] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Previous month"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-[140px] text-center">
                  {calendarMonth.toLocaleString("default", {
                    month: "long",
                  })}{" "}
                  {calendarMonth.getFullYear()}
                </div>
                <button
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  className="p-2 rounded-[15px] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Next month"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-9 gap-2 sm:gap-3 mb-4 w-full">
              {/* {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="text-xs font-semibold text-[#ADADAD] text-center"
                >
                  {d}
                </div>
              ))} */}
              {getMonthDaysGrid(calendarMonth).map((d, idx) => {
                const isToday = d && isSameDay(d, new Date());
                const isSelected = d && isSameDay(d, selectedDate);
                const isPast =
                  d &&
                  !isToday &&
                  d < new Date(new Date().setHours(0, 0, 0, 0));
                const events = d
                  ? getEventsForDate(d)
                  : { tasks: [], meetings: [], total: 0 };
                const hasEvents = events.total > 0;

                return (
                  <button
                    key={idx}
                    onClick={() => d && !isPast && setSelectedDate(d)}
                    className={[
                      "relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl border flex flex-col items-center justify-center text-sm transition-all duration-200 group",
                      !d
                        ? "border-transparent cursor-default"
                        : isPast
                          ? "border-[#ADADAD]/30 dark:border-gray-700 opacity-40 cursor-not-allowed"
                          : "border-[#ADADAD]/35 dark:border-gray-700 hover:border-black dark:hover:border-[#75FC96] hover:shadow-md cursor-pointer",
                      isToday
                        ? "ring-2 ring-[#75FC96] ring-offset-1"
                        : "",
                      isSelected
                        ? "bg-black border-none text-white font-bold"
                        : "text-black dark:text-gray-200",
                      hasEvents && !isSelected
                        ? "bg-gray-100 dark:bg-gray-800/50"
                        : "",
                    ].join(" ")}
                    disabled={!d || isPast}
                    aria-label={d ? d.toDateString() : "empty"}
                  >
                    {d && (
                      <>
                        <span>{d.getDate()}</span>
                        {hasEvents && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {events.tasks.length > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#75FC96]"></div>
                            )}
                            {events.meetings.length > 0 && (
                              <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-black"} dark:bg-white`}></div>
                            )}
                          </div>
                        )}
                        {events.total > 2 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#75FC96] text-black text-[10px] font-bold flex items-center justify-center">
                            {events.total}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
              
              <div className="flex flex-row gap-3 sm:max-w-md w-full">
                <Button
                  variant={"default"}
                  onClick={() => {
                    if (!permissions.canCreateTask) {
                      toast.error(
                        "You do not have permission to create tasks. Contact an admin.",
                      );
                      return;
                    }
                    navigate("/dashboard/tasks", {
                      state: {
                        date: selectedDate.toLocaleDateString("en-CA", {
                          timeZone: "Asia/Karachi",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }),
                        openModal: true,
                      },
                    });
                  }}
                  disabled={!permissions.canCreateTask}
                  className="flex-1 h-11 font-semibold w-[100px] rounded-xl text-sm bg-gradient-to-r from-[#75FC96] to-[#4fd972] text-black transition-[opacity,box-shadow] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Schedule Task
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() => {
                    if (!permissions.canCreateMeeting) {
                      toast.error(
                        "You do not have permission to create meetings. Contact an admin.",
                      );
                      return;
                    }
                    navigate("/dashboard/meetings", {
                      state: {
                        date: selectedDate.toLocaleDateString("en-CA", {
                          timeZone: "Asia/Karachi",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }),
                        openModal: true,
                      },
                    });
                  }}
                  disabled={!permissions.canCreateMeeting}
                  className="flex-1 h-11 rounded-xl text-sm border border-gray-300 dark:border-gray-700 font-semibold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-[background-color,color,opacity] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </motion.div>
          </SortableWidget>

          <SortableWidget
            id="team"
            order={order.indexOf("team")}
            cols={sizes.team?.cols}
            height={sizes.team?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <TeamStatus
              currentUser={user}
              inProgressCount={inProgressCount}
              onUserClick={handleTeamUserClick}
            />
          </SortableWidget>

         
        </div>
      </div>

      <CreateTaskModal
        open={!!taskRepoModal}
        onOpenChange={(open) => !open && setTaskRepoModal(null)}
        repository={taskRepoModal}
        onCreated={loadDashboardData}
      />
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

export default Dashboard;
