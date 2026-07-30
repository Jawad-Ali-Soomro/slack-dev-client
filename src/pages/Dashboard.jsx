import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardSkeleton, {
  GithubReposSkeleton,
} from "../components/dashboard/DashboardSkeleton";
import { usePermissions } from "../hooks/usePermissions";
import ReactECharts from "echarts-for-react";
import {
  CheckCircle,
  Target,
  Activity,
  Video,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Github,
  Key,
  LockKeyhole,
  LockKeyholeOpen,
  MoreHorizontal,
  ChevronRight,
  FolderGit2,
  ExternalLink,
  Clock,
  CircleDot,
  AlertCircle,
  CalendarDays,
  XCircle,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import UserDetailsModal from "../components/UserDetailsModal";
import taskService from "../services/taskService";
import meetingService from "../services/meetingService";
import projectService from "../services/projectService";
import { toast } from "sonner";
import StatsCard from "../components/StatsCard";
import { Button } from "@/components/ui/button";
import useGithubRepos, { connectGithub } from "@/hooks/useGithubRepos";
import { RiDashboard2Line } from "react-icons/ri";
import { BiKey, BiLogoInternetExplorer } from "react-icons/bi";
import { GoBrowser } from "react-icons/go";
import CreateTaskModal from "../components/CreateTaskModal";
import LanguageIcon from "@/components/Languages";
import TeamStatus from "../components/dashboard/TeamStatus";
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

  const statusData = useMemo(
    () => [
      { name: "Deployed", value: stats.completedTasks, color: "#10B981" },
      {
        name: "In Development",
        value: stats.inProgressTasks,
        color: "#3B82F6",
      },
      { name: "Backlog", value: stats.pendingTasks, color: "#F59E0B" },
      { name: "Blocked", value: stats.overdueTasks, color: "#EF4444" },
    ],
    [
      stats.completedTasks,
      stats.inProgressTasks,
      stats.pendingTasks,
      stats.overdueTasks,
    ],
  );

  const nightingaleOption = useMemo(() => {
    const chartData = statusData.map((item) => ({
      value: item.value || 0,
      name: item.name,
      itemStyle: {
        color: item.color,
      },
      selected: item.name === "Deployed", // Highlight "Deployed"
    }));

    const filteredData = chartData.filter((item) => item.value > 0);

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "transparent",
        textStyle: {
          color: "#fff",
        },
        borderRadius: 15,
        padding: [10, 15],
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: "Task Status",
          type: "pie",
          radius: ["30%", "70%"],
          center: ["50%", "50%"],
          roseType: "area",
          selectedMode: "single",
          selectedOffset: 8,
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            fontSize: 12,
            fontWeight: "bold",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
            scale: true,
            scaleSize: 5,
          },
          data: filteredData.length > 0 ? filteredData : chartData,
        },
      ],
    };
  }, [statusData]);

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
        color: "#3B82F6",
      },
      {
        name: "Concluded",
        value: weeklyMeetingsList.filter((m) => m.status === "completed")
          .length,
        color: "#10B981",
      },
      {
        name: "Draft",
        value: weeklyMeetingsList.filter((m) => m.status === "pending").length,
        color: "#F59E0B",
      },
      {
        name: "Cancelled",
        value: weeklyMeetingsList.filter((m) => m.status === "cancelled")
          .length,
        color: "#EF4444",
      },
    ],
    [weeklyMeetingsList],
  );

  function createPattern() {
    const canvas = document.createElement("canvas");
    canvas.width = 10;
    canvas.height = 10;

    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "#BDBDBD";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(10, 0);
    ctx.stroke();

    return canvas;
  }

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
              color: value === maxValue ? "#ff914b" : "#e8772e",
              borderRadius: 40,
            },
          })),
        },
      ],
    };
  }, [weeklyMeetingsList]);
  const projectStatusData = useMemo(
    () => [
      { name: "Active", value: stats.activeProjects, color: "#10B981" },
      {
        name: "Planning",
        value: projects.filter((project) => project.status === "planning")
          .length,
        color: "#3B82F6",
      },
      { name: "Completed", value: stats.completedProjects, color: "#6B7280" },
      {
        name: "On Hold",
        value: projects.filter((project) => project.status === "on_hold")
          .length,
        color: "#F59E0B",
      },
    ],
    [stats.activeProjects, stats.completedProjects, projects],
  );

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
    return sorted.slice(0, 7);
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

  const githubRepos = useMemo(() => {
    return githubReposRaw ?? [];
  }, [githubReposRaw]);

  const displayedRepos = githubRepos.slice(0, 8);
  const hasMoreRepos = githubRepos.length > 6;

  const completionRate = useMemo(() => {
    if (!projects?.length) return 0;

    const completed = projects.filter((p) => p.status === "completed").length;

    return Math.round((completed / projects.length) * 100);
  }, [projects]);

  const weeklyActivityOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "transparent",
        textStyle: {
          color: "#fff",
        },
        borderRadius: 15,
        padding: [10, 15],
      },
      legend: {
        data: ["Tasks", "Meetings", "Projects"],
        bottom: 0,
        textStyle: {
          color: "#9CA3AF",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: weeklyData.map((item) => item.day),
        axisLine: {
          lineStyle: {
            color: "#9CA3AF",
          },
        },
        axisLabel: {
          color: "#9CA3AF",
        },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLine: {
          lineStyle: {
            color: "#9CA3AF",
          },
        },
        axisLabel: {
          color: "#9CA3AF",
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
          name: "Tasks",
          type: "line",
          data: weeklyData.map((item) => item.Task),
          smooth: true,
          lineStyle: {
            width: 3,
            color: "#ff914b",
          },
          itemStyle: {
            color: "#ff914b",
          },
          symbol: "circle",
          symbolSize: 6,
        },
        {
          name: "Meetings",
          type: "line",
          data: weeklyData.map((item) => item.Meeting),
          smooth: true,
          lineStyle: {
            width: 3,
            color: "#10B981",
          },
          itemStyle: {
            color: "#10B981",
          },
          symbol: "circle",
          symbolSize: 6,
        },
        {
          name: "Projects",
          type: "line",
          data: weeklyData.map((item) => item.Project),
          smooth: true,
          lineStyle: {
            width: 3,
            color: "#e8772e",
          },
          itemStyle: {
            color: "#e8772e",
          },
          symbol: "circle",
          symbolSize: 6,
        },
      ],
    };
  }, [weeklyData]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-glow">
            <StatsCard
              title="Active Tasks"
              value={stats.totalTasks}
              icon={Target}
              color="orange"
              subtitle="Currently in progress"
              delay={0.1}
            />
          </div>
          <div className="card-glow">
            <StatsCard
              title="Completed"
              value={stats.completedTasks}
              icon={CheckCircle}
              color="neutral"
              trend="up"
              trendValue={stats.completionRate}
              subtitle="Successfully delivered"
              delay={0.2}
            />
          </div>
          <div className="card-glow">
            <StatsCard
              title="Team Meetings"
              value={stats.totalMeetings}
              icon={Video}
              color="neutral"
              subtitle="Collaboration sessions"
              delay={0.3}
            />
          </div>
          <div className="card-glow">
            <StatsCard
              title="Active Projects"
              value={stats.activeProjects}
              icon={Activity}
              color="neutral"
              subtitle="Currently running"
              delay={0.4}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-col w-[100%] lg:w-[60%]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mb-8 overflow-hidden"
            >
              {/* Weekly Activity Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="dashboard-card p-6 hidden md:block"
              >
                <div className="dashboard-section-title mb-6">
                  <div className="dashboard-section-icon">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white">
                      Weekly Activity
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Tasks, meetings & projects over 7 days
                    </p>
                  </div>
                </div>
                <div style={{ width: "100%", height: "400px" }}>
                  <ReactECharts
                    option={weeklyActivityOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                </div>
              </motion.div>

              {/* Status Distribution Charts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 gap-5 mt-5"
              >
                {/* Task Status Distribution */}
                <div className="dashboard-card p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="dashboard-section-icon">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xl  text-gray-900 dark:text-white font-bold">
                          Task Status
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">
                          Current Task distribution
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-900 dark:text-white">
                        {stats.totalTasks}
                      </div>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: "300px" }}>
                    {statusData.some((item) => item.value > 0) ? (
                      <ReactECharts
                        option={nightingaleOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                        notMerge={true}
                        lazyUpdate={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        <p>No task data available</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 grid-cols-1 gap-3 mt-6">
                    {statusData.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 + index * 0.1 }}
                        className="flex items-center w-full p-6 px-6 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[15px]"
                      >
                        <div
                          className="w-4 h-4 mr-3 rounded-[15px] shadow-sm"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="w-full">
                          <div className="flex justify-between items-center w-full">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                              {item.name}
                            </div>
                            <div className="text-sm  font-bold text-gray-900 dark:text-white">
                              {item.value}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Meeting Status Distribution */}
                <div className="dashboard-card p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="dashboard-section-icon">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xl  text-gray-900 dark:text-white font-bold">
                          Meeting Status
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">
                          This week&apos;s meeting distribution
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-900 dark:text-white">
                        {weeklyMeetingsList.length}
                      </div>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: "300px" }}>
                    {meetingStatusData.some((item) => item.value > 0) ? (
                      <ReactECharts
                        option={meetingStatusOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                        notMerge={true}
                        lazyUpdate={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        <p>No meeting data available</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 grid-cols-1 gap-3 mt-6">
                    {meetingStatusData.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.6 + index * 0.1 }}
                        className="flex items-center p-6 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[15px]"
                      >
                        <div
                          className="w-4 h-4  rounded-[15px] mr-3 shadow-sm"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="w-full">
                          <div className="flex justify-between items-center w-full">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                              {item.name}
                            </div>
                            <div className="text-sm  font-bold text-gray-900 dark:text-white">
                              {item.value}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.6 }}
              className="mb-20 grid grid-cols-1 items-stretch gap-8"
            >
              <div className="dashboard-card p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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
                      onClick={() =>
                        setCalendarMonth(addMonths(calendarMonth, -1))
                      }
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
                      onClick={() =>
                        setCalendarMonth(addMonths(calendarMonth, 1))
                      }
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

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center py-2"
                      >
                        {d}
                      </div>
                    ),
                  )}
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
                          "relative h-12 rounded-xl border flex flex-col items-center justify-center text-sm transition-all duration-200 group",
                          !d
                            ? "border-transparent cursor-default"
                            : isPast
                              ? "border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md cursor-pointer",
                          isToday
                            ? "ring-2 ring-[#ff914b] dark:ring-[#ffb07a] ring-offset-1"
                            : "",
                          isSelected
                            ? "bg-[#ff914b] border-none text-white  border-[#ff914b] font-bold"
                            : "text-gray-800 dark:text-gray-200",
                          hasEvents && !isSelected
                            ? "bg-gray-50 dark:bg-gray-800/50"
                            : "",
                        ].join(" ")}
                        disabled={!d || isPast}
                        aria-label={d ? d.toDateString() : "empty"}
                      >
                        {d && (
                          <>
                            <span className={isSelected ? "f" : ""}>
                              {d.getDate()}
                            </span>
                            {hasEvents && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {events.tasks.length > 0 && (
                                  <div className="w-1.5 h-1.5 rounded-[15px] bg-green-500"></div>
                                )}
                                {events.meetings.length > 0 && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-theme"></div>
                                )}
                              </div>
                            )}
                            {events.total > 2 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-theme text-white text-[10px] font-bold flex items-center justify-center">
                                {events.total}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-4  border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-[15px] bg-green-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-theme"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Meetings
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-row gap-3">
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
                    className="flex-1 h-14 sm:h-12 font-semibold rounded-xl text-sm bg-gradient-to-r from-orange-300 to-orange-400 text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    className="flex-1 h-14 sm:h-12 rounded-xl text-sm border font-semibold border-[#ff914b] dark:border-[#ffb07a] text-theme dark:text-theme-light hover:bg-theme-subtle transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Schedule Meeting
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div className="h-auto flex flex-col gap-5 w-full lg:w-[40%] pb-20">
            {/* GitHub */}
            {githubLoading ? (
              <GithubReposSkeleton />
            ) : (
              <motion.div
                className="dashboard-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex gap-2 items-center justify-between icon border-gray-100 dark:border-[rgba(255,255,255,.1)] mb-4">
                  <div className="flex items-center gap-3 min-w-0 icon">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden border border-gray-200/50 dark:border-white/10">
                      {githubData?.profile?.avatar_url ? (
                        <img
                          className="w-full h-full object-cover rounded-[10px]"
                          src={githubData.profile.avatar_url}
                          alt={githubData?.profile?.login || "GitHub avatar"}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Github className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate icon">
                        {githubData?.profile?.login || "GitHub"}
                      </h2>
                    </div>
                  </div>
                </div>
                {isGithubConnected && githubRepos.length > 0 ? (
                  <>
                    <ul className="space-y-2">
                      {displayedRepos.map((repo) => (
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
                            className="flex items-center gap-3 py-2.5 w-full px-3 relative rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group cursor-pointer"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200/80 dark:bg-white/10 flex items-center justify-center">
                              <FolderGit2 className="w-4 h-4 icon text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex gap-2 justify-center items-center min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-theme">
                                {repo.name}
                              </p>
                              <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 truncate flex justify-start gap-2 items-center icon">
                                <span className="px-3 py-1.5 bg-theme text-white rounded-full">
                                  {repo.private ? "Private" : "Public"}{" "}
                                </span>
                                {<LanguageIcon language={repo.language} />}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-theme transition-all absolute right-3"
                              title={`Create task for ${repo.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateTaskFromRepo(repo);
                              }}
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                    {hasMoreRepos && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 rounded-lg capitalize font-bold   border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                        onClick={() => navigate("/dashboard/repos")}
                      >
                        {`View all repositories (${githubRepos.length})`}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 px-4">
                    <Github className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {isGithubConnected
                        ? "No repositories to show."
                        : "Connect your GitHub account to see your repositories."}
                    </p>
                    {!isGithubConnected && (
                      <Button
                        type="button"
                        onClick={connectGithub}
                        className="rounded-xl bg-black text-white dark:bg-white dark:text-black"
                      >
                        Connect GitHub
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Recent Tasks */}
            <motion.div
              className="dashboard-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="dashboard-section-icon !w-8 !h-8 !rounded-lg">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Recent Tasks
                  </h3>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-gray-300 transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              {recentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
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
                    return (
                      <li
                        key={task.id || task._id}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
                          <div className="flex items-center gap-2 mt-0.5">
                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <CalendarIcon className="w-3.5 h-3.5 icon" />
                                {new Date(task.dueDate).toLocaleDateString(
                                  undefined,
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                            )}
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

            {/* Recent Meetings */}
            <motion.div
              className="dashboard-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="dashboard-section-icon !w-8 !h-8 !rounded-lg">
                    <Video className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Recent Meetings
                  </h3>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-gray-300 transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              {recentMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                  <Video className="w-10 h-10 mb-2 opacity-50 icon" />
                  <p className="text-sm">No meetings yet</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentMeetings.map((meeting) => {
                    const status = (meeting.status || "").toLowerCase();
                    const StatusIcon =
                      status === "completed"
                        ? CheckCircle
                        : status === "scheduled"
                          ? CalendarDays
                          : status === "cancelled"
                            ? XCircle
                            : Clock;
                    const statusColor =
                      status === "completed"
                        ? "text-emerald-500"
                        : status === "scheduled"
                          ? "text-blue-500"
                          : status === "cancelled"
                            ? "text-red-500"
                            : "text-amber-500";
                    const statusBg =
                      status === "completed"
                        ? "bg-emerald-500/10"
                        : status === "scheduled"
                          ? "bg-blue-500/10"
                          : status === "cancelled"
                            ? "bg-red-500/10"
                            : "bg-amber-500/10";
                    return (
                      <li
                        key={meeting.id || meeting._id}
                        className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => navigate("/dashboard/meetings")}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${statusBg}`}
                        >
                          <StatusIcon
                            className={`w-4 h-4 ${statusColor} icon`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {meeting.title ||
                              meeting.name ||
                              "Untitled meeting"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {meeting.startDate && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <CalendarIcon className="w-3.5 h-3.5 icon" />
                                {new Date(meeting.startDate).toLocaleDateString(
                                  undefined,
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                            )}
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
                onClick={() => navigate("/dashboard/meetings")}
              >
                Show details
              </Button>
            </motion.div>

            {/* Team Status */}
            <TeamStatus
              currentUser={user}
              inProgressCount={inProgressCount}
              onUserClick={handleTeamUserClick}
            />
          </motion.div>
        </div>
      </div>

      {/* User Details Modal */}
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
