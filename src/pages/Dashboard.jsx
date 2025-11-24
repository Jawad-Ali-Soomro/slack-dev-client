import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HorizontalLoader from "../components/HorizontalLoader";
import { usePermissions } from "../hooks/usePermissions";
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
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import UserDetailsModal from "../components/UserDetailsModal";
import taskService from "../services/taskService";
import meetingService from "../services/meetingService";
import projectService from "../services/projectService";
import { toast } from "sonner";
import StatsCard from "../components/StatsCard";
import { PiUsersDuotone } from "react-icons/pi";
import { RiDashboard2Fill } from "react-icons/ri";
import { BsDashCircle } from "react-icons/bs";

const Dashboard = () => {

  document.title = "Dashboard"

  const { user } = useAuth();
  const { permissions, loading: permissionsLoading } = usePermissions();
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
  const meetingStatusData = [
    { name: "Scheduled", value: stats.scheduledMeetings, color: "#3B82F6" },
    { name: "Concluded", value: stats.completedMeetings, color: "#10B981" },
    { name: "Draft", value: stats.pendingMeetings, color: "#F59E0B" },
    { name: "Cancelled", value: stats.cancelledMeetings, color: "#EF4444" },
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

                <div className="flex py-6 gap-3 items-center fixed z-10 -top-3 z-10">
                <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
                <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
                  <LayoutDashboard  size={15} />
                  </div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                </div>
                </div>

            {/* Quick stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
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

          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard
              title="In Progress"
              value={stats.inProgressTasks}
              ={Clock}
              color="purple"
              subtitle="Being worked on"
              delay={0.5}
            />
            <StatsCard
              title="Scheduled"
              value={stats.scheduledMeetings}
              ={Calendar}
              color="cyan"
              subtitle="Upcoming meetings"
              delay={0.6}
            />
            <StatsCard
              title="Concluded"
              value={stats.completedMeetings}
              ={Award}
              color="orange"
              trend="up"
              trendValue={stats.meetingCompletionRate}
              subtitle="Successfully completed"
              delay={0.7}
            />
            <StatsCard
              title="Avg Progress"
              value={`${stats.averageProgress}%`}
              ={TrendingUp}
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
            className="mb-12 overflow-hidden ambient-section"
          >
           

            {/* Weekly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="mt-10"
            >
              {/* <div className="flex items-center justify-end mb-8">
               
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4  bg-gradient-to-r from-blue-500 to-blue-600 rounded-[30px]"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tasks
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4  bg-gradient-to-r from-purple-500 to-purple-600 rounded-[30px]"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Meetings
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4  bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-[30px]"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Projects
                    </span>
                  </div>
                </div>
              </div> */}
              <div className=" rounded-[30px]">
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
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid
                      strokeDasharray="3 2"
                      stroke="#9CA3AF"
                      opacity={0.3}
                    />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{
                      border: "none",
                      borderRadius: "15px",
                      color: "black",
                      padding: "10px 50px",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      // backdropFilter: "blur(10px)",
                      fontWeight: 600,
                      justifyContent: "space-between"
                    }} />
                    <Legend />

                    {/* Tasks line */}
                    <Line
                      type="monotone"
                      dataKey="Task"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fontWeight={900}
                      dot={{ r: 5, fill: "#3B82F6" }}
                      style={{
                        textTransform: ''
                      }}
                    />

                    {/* Meetings line */}
                    <Line
                      type="monotone"
                      dataKey="Meeting"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#10B981" }}
                    />

                    {/* Projects line */}
                    <Line
                      type="monotone"
                      dataKey="Project"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#8B5CF6" }}
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
                          stopColor="#6B7280"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6B7280"
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
                          stopColor="#4B5563"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4B5563"
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
                          stopColor="#374151"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#374151"
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50"
            >
              {/* Task Status Distribution */}
              <div className="backdrop-blur-sm rounded-[30px] p-6 border-gray-200">
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
                        borderRadius: "15px",
                        color: "white",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
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
              <div className="rounded-[30px] p-6">
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
                        borderRadius: "15px",
                        color: "white",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
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
            {/* Project Chart Header */}
            

            {/* Project Status Distribution */}
            <div className="mt-10">
              <div className="p-6 ">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg  text-gray-800 dark:text-gray-200 font-bold">
                  Project Status Distribution
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-bold">
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
                      borderRadius: "15px",
                      color: "white",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-6">
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
              <div className="rounded-[30px] p-6">
                <div className="flex items-center justify-end mb-6">
                  {/* <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300 rounded-[30px]">
                      <Calendar className="w-5 h-5  text-white dark:text-gray-800" />
                    </div>
                    <div>
                      <h4 className="text-lg  text-gray-800 dark:text-gray-200">Schedule</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Plan tasks or meetings</p>
                    </div>
                  </div> */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                      className="px-3 py-2 rounded-[30px] w-10 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900"
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {calendarMonth.toLocaleString('default', { month: 'long' })} {calendarMonth.getFullYear()}
                    </div>
                    <button
                      onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                      className="px-3 py-2 rounded-[30px] w-10 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900"
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                    <div key={d} className="text-xs font-bold text-gray-500 dark:text-gray-400 text-start py-1">{d}</div>
                  ))}
                  {getMonthDaysGrid(calendarMonth).map((d, idx) => {
                    const isToday = d && isSameDay(d, new Date());
                    const isSelected = d && isSameDay(d, selectedDate);
                    return (
                      <button
                        key={idx}
                        onClick={() => d && setSelectedDate(d)}
                        className={[
                          "h-12 rounded-[14px] border flex font-bold items-center justify-center text-sm transition-colors",
                          d ? "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900" : "border-transparent",
                          isToday ? "ring-2 ring-black dark:ring-white" : "",
                          isSelected ? "bg-white text-black border-none" : "text-gray-800 dark:text-gray-200"
                        ].join(' ')}
                        disabled={!d}
                        aria-label={d ? d.toDateString() : 'empty'}
                      >
                        {d ? d.getDate() : ''}
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-end justify-end">
                
                  <div className="flex gap-3 flex-col sn:flex-row">
                    <button
                      onClick={() => {
                        if (!permissions.canCreateTask) {
                          toast.error('You do not have permission to create tasks. Contact an admin.');
                          return;
                        }
                        navigate('/dashboard/tasks', { state: { date: selectedDate.toISOString(), openModal: true } });
                      }}
                      disabled={!permissions.canCreateTask}
                      className="w-[250px] h-12 font-bold rounded-[15px] text-sm bg-white dark:bg-white text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Schedule Task
                    </button>
                    <button
                      onClick={() => {
                        if (!permissions.canCreateMeeting) {
                          toast.error('You do not have permission to create meetings. Contact an admin.');
                          return;
                        }
                        navigate('/dashboard/meetings', { state: { date: selectedDate.toISOString(), openModal: true } });
                      }}
                      disabled={!permissions.canCreateMeeting}
                      className="w-[250px] h-12 rounded-[15px] text-sm border border-gray-300 font-bold dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Schedule Meeting
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </motion.div>

        {/* Recent Activity Feed */}

        
      <motion.div />
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

