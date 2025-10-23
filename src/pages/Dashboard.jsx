import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  Video,
  MapPin,
  XCircle,
  Zap,
  Star,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Eye,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import UserDetailsModal from "../components/UserDetailsModal";
import taskService from "../services/taskService";
import meetingService from "../services/meetingService";
import projectService from "../services/projectService";
import { toast } from "sonner";
import StatsCard from "../components/StatsCard";

const Dashboard = () => {

  document.title = "Dashboard"

  const { user } = useAuth();
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

  // Handle user avatar click
  const handleUserAvatarClick = (userId) => {
    console.log("Dashboard avatar clicked for user ID:", userId);
    setSelectedUserId(userId);
    setShowUserDetails(true);
    console.log("Modal should open now");
  };

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
    console.log("Dashboard useEffect triggered:", { user: user?.id });
    if (user && user.id) {
      loadDashboardData();
    }
  }, [user]);

  // Chart data
  const statusData = [
    { name: "Deployed", value: stats.completedTasks, color: "#10B981",  },
    { name: "In Development", value: stats.inProgressTasks, color: "#3B82F6" },
    { name: "Backlog", value: stats.pendingTasks, color: "#F59E0B" },
    { name: "Blocked", value: stats.overdueTasks, color: "#EF4444" },
  ];

  const priorityData = [
    {
      name: "Critical",
      value: tasks.filter((task) => task.priority === "high").length,
      color: "#EF4444",
    },
    {
      name: "High Priority",
      value: tasks.filter((task) => task.priority === "medium").length,
      color: "#F59E0B",
    },
    {
      name: "Low Priority",
      value: tasks.filter((task) => task.priority === "low").length,
      color: "#10B981",
    },
  ];

  // Weekly combined data (last 7 days)
  const getWeeklyData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

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
        tasks: tasksOnDay,
        meetings: meetingsOnDay,
        projects: projectsOnDay,
      });
    }
    return days;
  };

  const weeklyData = getWeeklyData();

  // Meeting chart data
  const meetingStatusData = [
    { name: "Scheduled", value: stats.scheduledMeetings, color: "#3B82F6" },
    { name: "Concluded", value: stats.completedMeetings, color: "#10B981" },
    { name: "Draft", value: stats.pendingMeetings, color: "#F59E0B" },
    { name: "Cancelled", value: stats.cancelledMeetings, color: "#EF4444" },
  ];

  const meetingTypeData = [
    {
      name: "Remote",
      value: meetings.filter((meeting) => meeting.type === "online").length,
      color: "#3B82F6",
    },
    {
      name: "in-person",
      value: meetings.filter((meeting) => meeting.type === "in-person").length,
      color: "#10B981",
    },
    {
      name: "Hybrid",
      value: meetings.filter((meeting) => meeting.type === "hybrid").length,
      color: "#F59E0B",
    },
  ];

  // Project chart data
  const projectStatusData = [
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
  ];

  const projectPriorityData = [
    {
      name: "High",
      value: projects.filter((project) => project.priority === "high").length,
      color: "#EF4444",
    },
    {
      name: "Medium",
      value: projects.filter((project) => project.priority === "medium").length,
      color: "#F59E0B",
    },
    {
      name: "Low",
      value: projects.filter((project) => project.priority === "low").length,
      color: "#10B981",
    },
  ];

 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 mx-auto mb-6"></div>
            <div
              className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 text-lg font-medium"
          >
            Loading your dashboard...
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 dark:text-gray-500 text-sm mt-2"
          >
            Preparing your workspace
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mt-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Modern Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl font-bold text-gray-900 dark:text-white mb-3"
                >
                  Welcome Back!
                </motion.h1>
            
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-500 dark:text-gray-500 mt-1"
                >
                  Here's your comprehensive workspace overview , <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.username}</span>
                </motion.p>
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-3"
              >
                <motion.button
                  whileHover={{ scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadDashboardData}
                  className="flex items-center cursor-pointer space-x-2 px-10 py-4 bg-black dark:bg-white rounded-[25px] dark:border-gray-700 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4 text-white dark:text-black" />
                  <span className="text-sm font-medium text-white dark:text-black">
                    Refresh
                  </span>
                </motion.button>
              </motion.div>
            </div>

            {/* Quick stats bar */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="backdrop-blur-sm rounded-[25px] p-4 dark:bg-[rgba(255,255,255,.1)] border">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-[25px] animate-pulse"></div>
                  <div>
                    <p className="text-xs">
                      Status
                    </p>
                    <p className="text-lg font-semibold">
                      All Systems Active
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-white backdrop-blur-sm dark:bg-[rgba(255,255,255,.1)] border rounded-[25px] p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-[25px] animate-pulse"></div>
                  <div>
                    <p className="text-xs text-black dark:text-white">
                      Last Updated
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                     Updated Just now
                    </p>
                  </div>
                </div>
              </div>

              <div className=" text-black dark:text-white backdrop-blur-sm dark:bg-[rgba(255,255,255,.1)] border rounded-[25px] p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-[25px] animate-pulse"></div>
                  <div>
                    <p className="text-xs text-black dark:text-white">
                      Performance
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      Extra Excellent
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-black dark:text-white backdrop-blur-sm dark:bg-[rgba(255,255,255,.1)] border rounded-[25px] p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-[25px] animate-pulse"></div>
                  <div>
                    <p className="text-xs text-black dark:text-white">
                      Sync Status
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      Real Time Sync
                    </p>
                  </div>
                </div>
              </div>
            </motion.div> */}
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard
              title="Active Tasks"
              value={stats.totalTasks}
              icon={Target}
              color="blue"
              subtitle="Currently in progress"
              delay={0.1}
            />
            <StatsCard
              title="Completed"
              value={stats.completedTasks}
              icon={CheckCircle}
              color="green"
              trend="up"
              trendValue={stats.completionRate}
              subtitle="Successfully delivered"
              delay={0.2}
            />
            <StatsCard
              title="Team Meetings"
              value={stats.totalMeetings}
              icon={Video}
              color="purple"
              subtitle="Collaboration sessions"
              delay={0.3}
            />
            <StatsCard
              title="Active Projects"
              value={stats.activeProjects}
              icon={Activity}
              color="red"
              subtitle="Currently running"
              delay={0.4}
            />
          </div>

          {/* Secondary Metrics Grid */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard
              title="In Progress"
              value={stats.inProgressTasks}
              icon={Clock}
              color="purple"
              subtitle="Being worked on"
              delay={0.5}
            />
            <StatsCard
              title="Scheduled"
              value={stats.scheduledMeetings}
              icon={Calendar}
              color="cyan"
              subtitle="Upcoming meetings"
              delay={0.6}
            />
            <StatsCard
              title="Concluded"
              value={stats.completedMeetings}
              icon={Award}
              color="orange"
              trend="up"
              trendValue={stats.meetingCompletionRate}
              subtitle="Successfully completed"
              delay={0.7}
            />
            <StatsCard
              title="Avg Progress"
              value={`${stats.averageProgress}%`}
              icon={TrendingUp}
              color="purple"
              subtitle="Overall completion"
              delay={0.8}
            />
          </div> */}

          {/* Analytics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-3xl shadow-2xl mb-12 overflow-hidden"
          >
            {/* Header with modern styling */}
        

            {/* Weekly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="mb-12"
            >
              <div className="flex items-center justify-end mb-8">
               
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-[25px]"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tasks
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-[25px]"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Meetings
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-[25px]"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Projects
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-[25px] p-6 pt-20 pr-20 border dark:border-gray-700   dark:bg-[rgba(255,255,255,.1)] ">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      opacity={0.3}
                    />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />

                    {/* Tasks line */}
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#3B82F6" }}
                    />

                    {/* Meetings line */}
                    <Line
                      type="monotone"
                      dataKey="meetings"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#8B5CF6" }}
                    />

                    {/* Projects line */}
                    <Line
                      type="monotone"
                      dataKey="projects"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#10B981" }}
                    />

                    {/* Gradient defs */}
                    <defs>
                      <linearGradient
                        id="colorTasks"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorMeetings"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8B5CF6"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8B5CF6"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorProjects"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Status Distribution Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50"
            >
              {/* Task Status Distribution */}
              <div className="border  dark:bg-[rgba(255,255,255,.1)] backdrop-blur-sm rounded-[25px] p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[25px]">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        Task Status
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current distribution
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalTasks}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Tasks
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        border: "none",
                        borderRadius: "0px",
                        color: "white",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  {statusData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                      className="flex items-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[25px]"
                    >
                      <div
                        className="w-4 h-4 rounded-[25px] mr-3 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {item.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Meeting Status Distribution */}
              <div className="border  dark:bg-[rgba(255,255,255,.1)] backdrop-blur-sm rounded-[25px] p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-[25px]">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        Meeting Status
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current distribution
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalMeetings}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Meetings
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={meetingStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {meetingStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        border: "none",
                        borderRadius: "0px",
                        color: "white",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(10px)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  {meetingStatusData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.6 + index * 0.1 }}
                      className="flex items-center p-3 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] rounded-[25px]"
                    >
                      <div
                        className="w-4 h-4 rounded-[25px] mr-3 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {item.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Project Distribution Charts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8"
          >
            {/* Project Status Distribution */}
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Project Status Distribution
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.totalProjects} Total Projects
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      border: "none",
                      borderRadius: "0px",
                      color: "white",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center mt-4 gap-3">
                {projectStatusData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-[25px] mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Priority Distribution */}
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Project Priority Breakdown
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  By Priority Level
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectPriorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      border: "none",
                      borderRadius: "0px",
                      padding: '10px 30px',
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center mt-4 gap-3">
                {projectPriorityData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-[25px] mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    {/* <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}: {item.value}
                    </span> */}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Combined Priority & Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Task Priority Distribution */}
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Task Priority Breakdown
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  By Severity Level
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      border: "none",
                      borderRadius: "0px",
                      padding: '10px 30px',
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Meeting Type Distribution */}
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Meeting Format Analysis
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  By Communication Type
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={meetingTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      border: "none",
                      borderRadius: "0px",
                      // color: 'white',
                      padding: '10px 30px',
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Feed */}

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-black rounded-[25px] shadow-lg  dark:border-gray-700 mt-10 pb-10"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Performance Metrics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Key performance indicators and productivity metrics
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last 30 days
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.tasksThisWeek}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tasks This Week
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Development Velocity
              </div>
            </div>
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stats.tasksThisMonth}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tasks This Month
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Monthly Throughput
              </div>
            </div>
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stats.completionRate}%
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Task Success Rate
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Quality Metric
              </div>
            </div>
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {stats.meetingsThisWeek}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meetings This Week
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Collaboration
              </div>
            </div>
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6 text-center">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                {stats.meetingsThisMonth}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meetings This Month
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Team Sync
              </div>
            </div>
            <div className="border  dark:bg-[rgba(255,255,255,.1)] rounded-[25px] p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {stats.meetingCompletionRate}%
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meeting Efficiency
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Completion Rate
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
