import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HorizontalLoader from "../components/HorizontalLoader";
import { usePermissions } from "../hooks/usePermissions";
import ReactECharts from "echarts-for-react";
import {
  CheckCircle,
  Target,
  Activity,
  Video,
  LayoutDashboard,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import UserDetailsModal from "../components/UserDetailsModal";
import taskService from "../services/taskService";
import meetingService from "../services/meetingService";
import projectService from "../services/projectService";
import { toast } from "sonner";
import StatsCard from "../components/StatsCard";
import { Button } from "@/components/ui/button";
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
    // Meeting stats
    totalMeetings: 0,
    scheduledMeetings: 0,
    completedMeetings: 0,
    cancelledMeetings: 0,
    pendingMeetings: 0,
    meetingsThisWeek: 0,
    meetingsThisMonth: 0,
    meetingCompletionRate: 0,
    // Project stats
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Calendar helpers
  const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths = (date, months) => new Date(date.getFullYear(), date.getMonth() + months, 1);
  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const getMonthDaysGrid = (monthDate) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = [];
    // Leading blanks (Sun=0 ... Sat=6) but we'll render Mon-Sun layout visually with CSS order
    const leading = (start.getDay() + 6) % 7; // convert to Mon=0 ... Sun=6
    for (let i = 0; i < leading; i++) {
      days.push(null);
    }
    for (let d = 1; d <= end.getDate(); d++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
    }
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = useCallback((date) => {
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
      total: dayTasks.length + dayMeetings.length
    };
  }, [tasks, meetings]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Get all tasks for the current user
      const taskResponse = await taskService.getTasks({
        page: 1,
        limit: 100,
      });

      const allTasks = taskResponse.tasks || [];

      // Filter tasks based on authorization - show only tasks assigned to or assigned by current user
      const userTasks = allTasks.filter((task) => {
        if (!user || !user.id) return false;
        return task.assignTo?.id === user.id || task.assignedBy?.id === user.id;
      });

      setTasks(userTasks);

      // Get all meetings for the current user
      const meetingResponse = await meetingService.getMeetings({
        page: 1,
        limit: 100,
      });

      const allMeetings = meetingResponse.meetings || [];

      // Filter meetings based on authorization - show only meetings assigned to or assigned by current user
      const userMeetings = allMeetings.filter((meeting) => {
        if (!user || !user.id) return false;
        return (
          meeting.assignedTo?.id === user.id ||
          meeting.assignedBy?.id === user.id
        );
      });

      setMeetings(userMeetings);

      // Get projects for the current user
      const projectResponse = await projectService.getProjects({
        page: 1,
        limit: 100,
      });

      const allProjects = projectResponse.projects || [];
      setProjects(allProjects);

      // Get project statistics from backend
      const projectStatsResponse = await projectService.getProjectStats();
      const projectStats = projectStatsResponse.stats || {};

      // Calculate statistics
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Task statistics
      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter(
        (task) => task.status === "completed"
      ).length;
      const pendingTasks = userTasks.filter(
        (task) => task.status === "pending"
      ).length;
      const inProgressTasks = userTasks.filter(
        (task) => task.status === "in_progress"
      ).length;
      const overdueTasks = userTasks.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate) < now &&
          task.status !== "completed"
      ).length;

      const tasksThisWeek = userTasks.filter(
        (task) => new Date(task.createdAt) >= oneWeekAgo
      ).length;

      const tasksThisMonth = userTasks.filter(
        (task) => new Date(task.createdAt) >= oneMonthAgo
      ).length;

      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Meeting statistics
      const totalMeetings = userMeetings.length;
      const scheduledMeetings = userMeetings.filter(
        (meeting) => meeting.status === "scheduled"
      ).length;
      const completedMeetings = userMeetings.filter(
        (meeting) => meeting.status === "completed"
      ).length;
      const cancelledMeetings = userMeetings.filter(
        (meeting) => meeting.status === "cancelled"
      ).length;
      const pendingMeetings = userMeetings.filter(
        (meeting) => meeting.status === "pending"
      ).length;

      const meetingsThisWeek = userMeetings.filter(
        (meeting) => new Date(meeting.createdAt) >= oneWeekAgo
      ).length;

      const meetingsThisMonth = userMeetings.filter(
        (meeting) => new Date(meeting.createdAt) >= oneMonthAgo
      ).length;

      const meetingCompletionRate =
        totalMeetings > 0
          ? Math.round((completedMeetings / totalMeetings) * 100)
          : 0;

      // Project statistics from backend
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
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Chart data
  const statusData = useMemo(() => [
    { name: "Deployed", value: stats.completedTasks, color: "#10B981" },
    { name: "In Development", value: stats.inProgressTasks, color: "#3B82F6" },
    { name: "Backlog", value: stats.pendingTasks, color: "#F59E0B" },
    { name: "Blocked", value: stats.overdueTasks, color: "#EF4444" },
  ], [stats.completedTasks, stats.inProgressTasks, stats.pendingTasks, stats.overdueTasks]);

  // Nightingale chart option for Task Status
  const nightingaleOption = useMemo(() => {
    const chartData = statusData.map((item) => ({
      value: item.value || 0,
      name: item.name,
      itemStyle: {
        color: item.color,
      },
      selected: item.name === "Deployed", // Highlight "Deployed"
    }));

    // Filter out items with zero values to avoid chart issues
    const filteredData = chartData.filter(item => item.value > 0);

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


  // Weekly combined data (last 7 days)
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

  // Meeting chart data
  const meetingStatusData = useMemo(() => [
    { name: "Scheduled", value: stats.scheduledMeetings, color: "#3B82F6" },
    { name: "Concluded", value: stats.completedMeetings, color: "#10B981" },
    { name: "Draft", value: stats.pendingMeetings, color: "#F59E0B" },
    { name: "Cancelled", value: stats.cancelledMeetings, color: "#EF4444" },
  ], [stats.scheduledMeetings, stats.completedMeetings, stats.pendingMeetings, stats.cancelledMeetings]);

  // Meeting Status ECharts option
  const meetingStatusOption = useMemo(() => {
    const chartData = meetingStatusData.map((item) => ({
      value: item.value || 0,
      name: item.name,
      itemStyle: {
        color: item.color,
      },
      selected: item.name === "Scheduled", // Highlight "Scheduled"
    }));

    const filteredData = chartData.filter(item => item.value > 0);

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
          name: "Meeting Status",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
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
  }, [meetingStatusData]);

  // Project chart data
  const projectStatusData = useMemo(() => [
    { name: "Active", value: stats.activeProjects, color: "#10B981" },
    {
      name: "Planning",
      value: projects.filter((project) => project.status === "planning").length,
      color: "#3B82F6",
    },
    { name: "Completed", value: stats.completedProjects, color: "#6B7280" },
    {
      name: "On Hold",
      value: projects.filter((project) => project.status === "on_hold").length,
      color: "#F59E0B",
    },
  ], [stats.activeProjects, stats.completedProjects, projects]);

  // Project Status ECharts option
  const projectStatusOption = useMemo(() => {
    const chartData = projectStatusData.map((item) => ({
      value: item.value || 0,
      name: item.name,
      itemStyle: {
        color: item.color,
      },
      selected: item.name === "Active", // Highlight "Active"
    }));

    const filteredData = chartData.filter(item => item.value > 0);

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
          name: "Project Status",
          type: "pie",
          radius: ["30%", "60%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          selectedMode: "single",
          selectedOffset: 8,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            fontSize: 11,
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
  }, [projectStatusData]);

  // Weekly Activity ECharts option
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
            color: "#3B82F6",
          },
          itemStyle: {
            color: "#3B82F6",
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
            color: "#8B5CF6",
          },
          itemStyle: {
            color: "#8B5CF6",
          },
          symbol: "circle",
          symbolSize: 6,
        },
      ],
    };
  }, [weeklyData]);

  if (loading) {
    return (
      <HorizontalLoader 
        message="Loading your dashboard..."
        subMessage="Preparing your workspace"
        progress={75}
        className="min-h-screen"
      />
    );
  }

  return (
    <div className="min-h-screen ambient-light pt-10">
      <div className="mx-auto">
        <div className="mb-16">
          <div className="flex py-6 gap-3 items-center fixed z-10 md:-top-3 -top-30">
            <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
              <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
                <LayoutDashboard size={15} />
              </div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
          </div>

            {/* Quick stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-[30px] p-4 border border-purple-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3  bg-purple-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400  tracking-wide">
                      System Status
                    </p>
                    <p className="text-sm  text-purple-800 dark:text-purple-200">
                      All Systems Active
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-[30px] p-4 border border-green-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3  bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400  tracking-wide">
                      Last Updated
                    </p>
                    <p className="text-sm  text-green-800 dark:text-green-200">
                      Updated Just now
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-[30px] p-4 border border-orange-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3  bg-orange-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400  tracking-wide">
                      Performance
                    </p>
                    <p className="text-sm  text-orange-800 dark:text-orange-200">
                      Excellent Performance
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-[30px] p-4 border border-blue-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3  bg-blue-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400  tracking-wide">
                      Sync Status
                    </p>
                    <p className="text-sm  text-blue-800 dark:text-blue-200">
                      Real Time Synchronization
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="card-glow">
              <StatsCard
                title="Active Tasks"
                value={stats.totalTasks}
                icon={Target}
                color="neutral"
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


          {/* Analytics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mb-12 overflow-hidden ambient-section"
          >
           

            {/* Weekly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="mt-10"
            >
              <div className="rounded-[30px] hidden md:block">
                <div className="flex items-center justify-end py-10 mb-6">
                
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3  bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-blue-600 dark:text-blue-400">Tasks</span>
              </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3  bg-green-500 dark:bg-green-400 rounded-full"></div>
                      <span className="text-sm text-green-600 dark:text-green-400">Meetings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3  bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-purple-600 dark:text-purple-400">Projects</span>
                    </div>
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
              </div>
            </motion.div>

            {/* Status Distribution Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50"
            >
              {/* Task Status Distribution */}
              <div className="backdrop-blur-sm rounded-[30px] p-6 border-gray-300 dark:border-gray-700 border">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 rounded-[30px]">
                      <Target className="w-5 h-5  text-white dark:text-gray-800" />
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
                    <div className="text-2xl  text-gray-900 dark:text-white">
                      {stats.totalTasks}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Tasks
                    </div>
                  </div>
                </div>
                <div style={{ width: "100%", height: "300px" }}>
                  {statusData.some(item => item.value > 0) ? (
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
                      className="flex items-center p-3 bg-white dark:bg-[rgba(255,255,255,.1)] rounded-[30px]"
                    >
                      <div
                        className="w-4 h-4  rounded-[30px] mr-3 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div>
                        <div className="text-sm  text-gray-900 dark:text-white">
                          {item.value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                          {item.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Meeting Status Distribution */}
              <div className="rounded-[30px] p-6 border-gray-300 dark:border-gray-700 border">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 rounded-[30px]">
                      <Video className="w-5 h-5  text-white dark:text-gray-800" />
                    </div>
                    <div>
                      <h4 className="text-xl  text-gray-900 dark:text-white font-bold">
                        Meeting Status
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">
                        Current Meeting distribution
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl  text-gray-900 dark:text-white">
                      {stats.totalMeetings}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Meetings
                    </div>
                  </div>
                </div>
                <div style={{ width: "100%", height: "300px" }}>
                  {meetingStatusData.some(item => item.value > 0) ? (
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
                      className="flex items-center p-3 bg-white dark:bg-[rgba(255,255,255,.1)] rounded-[30px]"
                    >
                      <div
                        className="w-4 h-4  rounded-[30px] mr-3 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div>
                        <div className="text-sm  text-gray-900 dark:text-white">
                          {item.value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                          {item.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Project Distribution Charts + Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.6 }}
            className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Project Status Distribution */}
            <div className="mt-10">
              <div className="p-6 border-gray-300 dark:border-gray-700 border rounded-[30px]">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg  text-gray-800 dark:text-gray-200 font-bold">
                  Project Status Distribution
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                  {stats.totalProjects} Total Projects
                </div>
              </div>
              <div style={{ width: "100%", height: "300px" }}>
                {projectStatusData.some(item => item.value > 0) ? (
                  <ReactECharts
                    option={projectStatusOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <p>No project data available</p>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 grid-cols-1 gap-3 mt-6">
                {projectStatusData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + index * 0.1 }}
                    className="flex items-center p-3 bg-white dark:bg-[rgba(255,255,255,.1)] rounded-[30px]"
                  >
                    <div
                      className="w-4 h-4  rounded-[30px] mr-3 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <div className="text-sm  text-gray-900 dark:text-white">
                        {item.value}
                  </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                        {item.name}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            </div>

            {/* Schedule Calendar */}
            <div className="mt-10">
              <div className="rounded-[30px] p-6 border-gray-300 dark:border-gray-700 border dark:bg-[#111827] shadow-sm">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <CalendarIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
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
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Previous month"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-[140px] text-center">
                      {calendarMonth.toLocaleString('default', { month: 'long' })} {calendarMonth.getFullYear()}
                    </div>
                    <button
                      onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Next month"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                    <div key={d} className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center py-2">
                      {d}
                    </div>
                  ))}
                  {getMonthDaysGrid(calendarMonth).map((d, idx) => {
                    const isToday = d && isSameDay(d, new Date());
                    const isSelected = d && isSameDay(d, selectedDate);
                    const events = d ? getEventsForDate(d) : { tasks: [], meetings: [], total: 0 };
                    const hasEvents = events.total > 0;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => d && setSelectedDate(d)}
                        className={[
                          "relative h-14 rounded-xl border flex flex-col items-center justify-center text-sm transition-all duration-200 group",
                          d ? "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md cursor-pointer" : "border-transparent cursor-default",
                          isToday ? "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1" : "",
                          isSelected 
                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-300 font-bold" 
                            : "text-gray-800 dark:text-gray-200",
                          hasEvents && !isSelected ? "bg-gray-50 dark:bg-gray-800/50" : ""
                        ].join(' ')}
                        disabled={!d}
                        aria-label={d ? d.toDateString() : 'empty'}
                      >
                        {d && (
                          <>
                            <span className={isSelected ? "text-blue-700 dark:text-blue-300" : ""}>
                              {d.getDate()}
                            </span>
                            {hasEvents && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {events.tasks.length > 0 && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                )}
                                {events.meetings.length > 0 && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                )}
                              </div>
                            )}
                            {events.total > 2 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
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
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Meetings</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => {
                      if (!permissions.canCreateTask) {
                        toast.error('You do not have permission to create tasks. Contact an admin.');
                        return;
                      }
                      navigate('/dashboard/tasks', { state: { date: selectedDate.toISOString(), openModal: true } });
                    }}
                    disabled={!permissions.canCreateTask}
                    className="flex-1 h-12 font-semibold rounded-xl text-sm bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Schedule Task
                  </Button>
                  <Button
                  variant={'outline'}
                    onClick={() => {
                      if (!permissions.canCreateMeeting) {
                        toast.error('You do not have permission to create meetings. Contact an admin.');
                        return;
                      }
                      navigate('/dashboard/meetings', { state: { date: selectedDate.toISOString(), openModal: true } });
                    }}
                    disabled={!permissions.canCreateMeeting}
                    className="flex-1 h-12 rounded-xl text-sm border-2 border-blue-500 dark:border-blue-400 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Schedule Meeting
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
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

export default Dashboard;

