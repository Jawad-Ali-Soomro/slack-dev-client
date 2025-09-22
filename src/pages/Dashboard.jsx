import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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
  Legend
} from 'recharts'
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
  XCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import taskService from '../services/taskService'
import meetingService from '../services/meetingService'
import { toast } from 'sonner'

const Dashboard = () => {
  const { user } = useAuth()
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
    meetingCompletionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [meetings, setMeetings] = useState([])

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get all tasks for the current user
      const taskResponse = await taskService.getTasks({ 
        page: 1, 
        limit: 100 
      })
      
      const allTasks = taskResponse.tasks || []
      
      // Filter tasks based on authorization - show only tasks assigned to or assigned by current user
      const userTasks = allTasks.filter(task => {
        if (!user || !user.id) return false
        return task.assignTo?.id === user.id || task.assignedBy?.id === user.id
      })
      
      setTasks(userTasks)
      
      // Get all meetings for the current user
      const meetingResponse = await meetingService.getMeetings({ 
        page: 1, 
        limit: 100 
      })
      
      const allMeetings = meetingResponse.meetings || []
      
      // Filter meetings based on authorization - show only meetings assigned to or assigned by current user
      const userMeetings = allMeetings.filter(meeting => {
        if (!user || !user.id) return false
        return meeting.assignedTo?.id === user.id || meeting.assignedBy?.id === user.id
      })
      
      setMeetings(userMeetings)
      
      // Calculate statistics
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // Task statistics
      const totalTasks = userTasks.length
      const completedTasks = userTasks.filter(task => task.status === 'completed').length
      const pendingTasks = userTasks.filter(task => task.status === 'pending').length
      const inProgressTasks = userTasks.filter(task => task.status === 'in_progress').length
      const overdueTasks = userTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
      ).length
      
      const tasksThisWeek = userTasks.filter(task => 
        new Date(task.createdAt) >= oneWeekAgo
      ).length
      
      const tasksThisMonth = userTasks.filter(task => 
        new Date(task.createdAt) >= oneMonthAgo
      ).length
      
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      
      // Meeting statistics
      const totalMeetings = userMeetings.length
      const scheduledMeetings = userMeetings.filter(meeting => meeting.status === 'scheduled').length
      const completedMeetings = userMeetings.filter(meeting => meeting.status === 'completed').length
      const cancelledMeetings = userMeetings.filter(meeting => meeting.status === 'cancelled').length
      const pendingMeetings = userMeetings.filter(meeting => meeting.status === 'pending').length
      
      const meetingsThisWeek = userMeetings.filter(meeting => 
        new Date(meeting.createdAt) >= oneWeekAgo
      ).length
      
      const meetingsThisMonth = userMeetings.filter(meeting => 
        new Date(meeting.createdAt) >= oneMonthAgo
      ).length
      
      const meetingCompletionRate = totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0
      
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
        meetingCompletionRate
      })
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    console.log('Dashboard useEffect triggered:', { user: user?.id })
    if (user && user.id) {
      loadDashboardData()
    }
  }, [user])

  // Chart data
  const statusData = [
    { name: 'Completed', value: stats.completedTasks, color: '#10B981' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#3B82F6' },
    { name: 'Backlog', value: stats.pendingTasks, color: '#F59E0B' },
    { name: 'Blocked', value: stats.overdueTasks, color: '#EF4444' }
  ]

  const priorityData = [
    { name: 'Critical', value: tasks.filter(task => task.priority === 'high').length, color: '#EF4444' },
    { name: 'High', value: tasks.filter(task => task.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Normal', value: tasks.filter(task => task.priority === 'low').length, color: '#10B981' }
  ]

  // Weekly combined data (last 7 days)
  const getWeeklyData = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      
      const tasksOnDay = tasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate.toDateString() === date.toDateString()
      }).length
      
      const meetingsOnDay = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.createdAt)
        return meetingDate.toDateString() === date.toDateString()
      }).length
      
      days.push({
        day: dayName,
        tasks: tasksOnDay,
        meetings: meetingsOnDay
      })
    }
    return days
  }

  const weeklyData = getWeeklyData()

  // Meeting chart data
  const meetingStatusData = [
    { name: 'Scheduled', value: stats.scheduledMeetings, color: '#3B82F6' },
    { name: 'Completed', value: stats.completedMeetings, color: '#10B981' },
    { name: 'Draft', value: stats.pendingMeetings, color: '#F59E0B' },
    { name: 'Cancelled', value: stats.cancelledMeetings, color: '#EF4444' }
  ]

  const meetingTypeData = [
    { name: 'Online', value: meetings.filter(meeting => meeting.type === 'online').length, color: '#3B82F6' },
    { name: 'Physical', value: meetings.filter(meeting => meeting.type === 'i').length, color: '#10B981' },
    { name: 'Hybrid', value: meetings.filter(meeting => meeting.type === 'hybrid').length, color: '#F59E0B' }
  ]


  // Recent tasks (last 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Recent meetings (last 5)
  const recentMeetings = meetings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
          {trend && (
            <div className="flex items-center">
              {trend === 'up' ? <ArrowUp className="w-4 h-4 text-green-500 mr-1" /> : <ArrowDown className="w-4 h-4 text-red-500 mr-1" />}
              <span className={`text-sm font-semibold ${
                trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trendValue}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                vs last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color} shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.username}! Here's your task overview.
          </p>
        </div>

        {/* Development Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Tasks"
            value={stats.totalTasks}
            icon={Target}
            color="bg-blue-500"
          />
          <StatCard
            title="Delivered"
            value={stats.completedTasks}
            icon={CheckCircle}
            color="bg-green-500"
            trend="up"
            trendValue={stats.completionRate}
          />
          <StatCard
            title="In Development"
            value={stats.inProgressTasks}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Blocked"
            value={stats.overdueTasks}
            icon={AlertCircle}
            color="bg-red-500"
          />
        </div>

        {/* Collaboration Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Team Meetings"
            value={stats.totalMeetings}
            icon={Video}
            color="bg-purple-500"
          />
          <StatCard
            title="Scheduled"
            value={stats.scheduledMeetings}
            icon={Calendar}
            color="bg-blue-500"
          />
          <StatCard
            title="Concluded"
            value={stats.completedMeetings}
            icon={CheckCircle}
            color="bg-green-500"
            trend="up"
            trendValue={stats.meetingCompletionRate}
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelledMeetings}
            icon={XCircle}
            color="bg-red-500"
          />
        </div>

        {/* Comprehensive Data Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                Project Analytics Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive overview of development workflow metrics
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live Data</span>
            </div>
          </div>
          
          {/* Combined Weekly Activity Chart */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Sprint Activity Metrics
              </h4>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Development Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Team Meetings</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="tasks"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Development Tasks"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="meetings"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  name="Team Meetings"
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Combined Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            {/* Task Status Distribution */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Development Task Status
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.totalTasks} Total Tasks
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center mt-4 gap-3">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Status Distribution */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Team Meeting Status
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.totalMeetings} Total Meetings
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={meetingStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {meetingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center mt-4 gap-3">
                {meetingStatusData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Combined Priority & Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Task Priority Distribution */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
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
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Meeting Type Distribution */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
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
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Development Activity Feed
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time updates on project progress and team collaboration
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Auto-refresh</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tasks */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Recent Development Tasks
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentTasks.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No recent tasks found
                  </p>
                ) : (
                  recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {task.assignTo?.username || 'Unknown User'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Meetings */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <Video className="w-5 h-5 mr-2 text-purple-500" />
                Recent Team Meetings
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentMeetings.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No recent meetings found
                  </p>
                ) : (
                  recentMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-purple-500"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {meeting.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {meeting.assignedTo?.username || 'Unknown User'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                          meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {meeting.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          meeting.type === 'online' ? 'bg-blue-100 text-blue-800' :
                          meeting.type === 'in-person' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {meeting.type}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
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
      </motion.div>
    </div>
  )
}

export default Dashboard