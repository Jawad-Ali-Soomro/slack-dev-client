import { useState, useEffect, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import HorizontalLoader from "../components/HorizontalLoader"
import { usePermissions } from "../hooks/usePermissions"
import { Search, Plus, Edit, Trash2, Calendar, User, Clock, CheckCircle, AlertCircle, MoreVertical, Filter, ChevronDown, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Checkbox } from "../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import taskService from "../services/taskService"
import { userService } from "../services/userService"
import projectService from "../services/projectService"
import teamService from "../services/teamService"
import friendService from "../services/friendService"
import { useAuth } from "../contexts/AuthContext"
import { useNotifications } from "../contexts/NotificationContext"
import { getAvatarProps } from "../utils/avatarUtils"
import TaskEditModal from "../components/TaskEditModal"
import UserDetailsModal from "../components/UserDetailsModal"
import { getButtonClasses, getInputClasses, COLOR_THEME, ICON_SIZES } from "../utils/uiConstants"

const Tasks = () => {
  const { user } = useAuth()
  const { markAsReadByType } = useNotifications()
  const { permissions, loading: permissionsLoading } = usePermissions()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewTaskPopup, setShowNewTaskPopup] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    assignedToId: "",
    dueDate: "",
    projectId: "none"
  })
  const [assignedToSuggestions, setAssignedToSuggestions] = useState([])
  const [showAssignedToSuggestions, setShowAssignedToSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState("")
  const [teamMembers, setTeamMembers] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })


  // Load tasks from API
  // Handle user avatar click
  const handleUserAvatarClick = (userId) => {
    console.log('Tasks avatar clicked for user ID:', userId)
    setSelectedUserId(userId)
    setShowUserDetails(true)
    console.log('Modal should open now')
  }

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      const filters = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        priority: filterPriority !== "all" ? filterPriority : undefined,
        page: pagination.page,
        limit: pagination.limit
      }
      
      const response = await taskService.getTasks(filters)
      const allTasks = response.tasks || []
      
      // Filter tasks based on authorization - show only tasks assigned to or assigned by current user
      const authorizedTasks = allTasks.filter(task => {
        if (!user || !user.id) return false
        
        // Show tasks where current user is assigned to or assigned by
        return task.assignTo?.id === user.id || task.assignedBy?.id === user.id
      })
      
      setTasks(authorizedTasks)
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      toast.error(error.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterPriority, pagination.page, pagination.limit, user])

  // Load tasks on component mount and when filters change
  useEffect(() => {
    console.log('Tasks useEffect triggered:', { user: user?.id, filterStatus, filterPriority })
    if (user && user.id) {
      loadTasks()
    }
  }, [filterStatus, filterPriority, user])

  // Mark task notifications as read when user visits this page
  useEffect(() => {
    if (user && user.id) {
      markAsReadByType('tasks')
    }
  }, [user, markAsReadByType])

  // Handle navigation state for opening modal
  useEffect(() => {
    if (location.state?.openModal && location.state?.date) {
      const date = new Date(location.state.date)
      setNewTask(prev => ({
        ...prev,
        dueDate: date.toISOString().split('T')[0]
      }))
      setShowNewTaskPopup(true)
    }
  }, [location.state])

  // Load friends from API
  const loadUsers = async () => {
    try {
      const response = await friendService.getFriends()
      const friends = response.friends || []
      
      // Transform friends data to match the expected format and filter out current user
      const transformedUsers = friends
        .map(friendship => ({
          id: friendship.friend.id,
          name: friendship.friend.username,
          username: friendship.friend.username,
          email: friendship.friend.email,
          avatar: friendship.friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friendship.friend.username)}&background=random&color=fff&size=128`
        }))
        .filter(friend => friend.id !== user?.id) // Exclude current user
      
      setUsers(transformedUsers)
    } catch (error) {
      console.error('Error loading friends:', error)
      toast.error('Failed to load friends')
      setUsers([])
    }
  }

  // Load projects from API
  const loadProjects = async () => {
    try {
      const response = await projectService.getProjects({ limit: 100 })
      setProjects(response.projects || [])
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Failed to load projects')
      setProjects([])
    }
  }

  // Load teams from API
  const loadTeams = async () => {
    try {
      const response = await teamService.getTeams({ limit: 100 })
      setTeams(response.teams || [])
    } catch (error) {
      console.error('Error loading teams:', error)
    }
  }

  // Load team members
  const loadTeamMembers = async (teamId) => {
    if (!teamId) {
      setTeamMembers([])
      setAvailableUsers(users)
      return
    }
    try {
      const response = await teamService.getTeamMembers(teamId)
      setTeamMembers(response.members || [])
      setAvailableUsers(response.members || [])
    } catch (error) {
      console.error('Error loading team members:', error)
      setAvailableUsers(users)
    }
  }

  // Update available users based on project selection
  const updateAvailableUsers = useCallback(() => {
    if (newTask.projectId && newTask.projectId !== "none") {
      // Find the selected project
      const selectedProject = projects.find(p => p.id === newTask.projectId)
      if (selectedProject && selectedProject.teamId) {
        // If project has a team, load team members
        loadTeamMembers(selectedProject.teamId)
      } else {
        // If no team, show all users
        setAvailableUsers(users)
      }
    } else {
      // If no project selected, show all users
      setAvailableUsers(users)
    }
  }, [newTask.projectId, projects, users])

  // Load users and projects on component mount
  useEffect(() => {
    loadUsers()
    loadProjects()
    loadTeams()
  }, [])

  // Initialize available users when users are loaded
  useEffect(() => {
    setAvailableUsers(users)
  }, [users])

  // Update available users when project changes
  useEffect(() => {
    updateAvailableUsers()
  }, [updateAvailableUsers])

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.assignTo && task.assignTo.username && task.assignTo.username.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id))
    }
  }

  const handleSelectTask = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId))
    } else {
      setSelectedTasks([...selectedTasks, taskId])
    }
  }

  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) {
      toast.error("No tasks selected")
      return
    }
    
    setTasks(tasks.filter(task => !selectedTasks.includes(task.id)))
    setSelectedTasks([])
    toast.success(`${selectedTasks.length} task(s) deleted successfully!`)
  }

  const handleAssignedToChange = async (value) => {
    setNewTask({...newTask, assignedTo: value, assignedToId: ""})
    if (value.length > 0) {
      // Filter available users based on search term
      const filtered = availableUsers.filter(user => 
        (user.username || user.name).toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
      )
      setAssignedToSuggestions(filtered)
      setShowAssignedToSuggestions(true)
    } else {
      setShowAssignedToSuggestions(false)
    }
  }

  const selectUser = (user) => {
    setNewTask({
      ...newTask, 
      assignedTo: user.username || user.name,
      assignedToId: user.id
    })
    setShowAssignedToSuggestions(false)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "text-white bg-red-500 border border-red-500 px-4 py-2 min-w-[80px]"
      case "medium": return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[80px]"
      case "low": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[80px]"
      default: return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[80px]"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[100px]"
      case "in_progress": return "text-white bg-gray-500 border border-gray-500 px-4 py-2 min-w-[100px]"
      case "pending": return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[100px]"
      case "cancelled": return "text-white bg-red-500 border border-red-500 px-4 py-2 min-w-[100px]"
      default: return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[100px]"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 icon icon" />
      case "in_progress": return <Clock className="w-4 h-4 icon icon" />
      case "pending": return <AlertCircle className="w-4 h-4 icon icon" />
      case "cancelled": return <AlertCircle className="w-4 h-4 icon icon" />
      default: return <Clock className="w-4 h-4 icon icon" />
    }
  }

  const handleNewTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Please enter a task title")
      return
    }

    if (!newTask.assignedTo.trim() || !newTask.assignedToId) {
      toast.error("Please select a person to assign the task to")
      return
    }

    try {
      setLoading(true)
      
      // Check if we have a valid user ID
      if (!newTask.assignedToId) {
        toast.error("Please select a user to assign the task to")
        return
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        assignTo: newTask.assignedToId, // Use the stored user ID
        priority: newTask.priority,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        projectId: newTask.projectId && newTask.projectId !== "none" ? newTask.projectId : undefined
      }

      const response = await taskService.createTask(taskData)
      
      // Clear caches to ensure fresh data
      try {
        await taskService.clearTaskCaches()
      } catch (cacheError) {
        console.warn('Cache clear failed:', cacheError)
      }
      
      // Reload tasks to get the updated list
      await loadTasks()
      
      setNewTask({ title: "", description: "", priority: "medium", assignedTo: "", assignedToId: "", dueDate: "", projectId: "none" })
      setShowNewTaskPopup(false)
      toast.success("Task created successfully!")
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error(error.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      setLoading(true)
      await taskService.deleteTask(id)
      await loadTasks() // Reload tasks after deletion
      toast.success("Task deleted successfully!")
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error(error.message || 'Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true)
      await taskService.updateTaskStatus(taskId, newStatus)
      await loadTasks() // Reload tasks after status change
      toast.success("Task status updated successfully!")
    } catch (error) {
      console.error('Error updating task status:', error)
      toast.error(error.message || 'Failed to update task status')
    } finally {
      setLoading(false)
    }
  }

  // Edit task functions
  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowEditModal(true)
  }

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    )
    setShowEditModal(false)
    setEditingTask(null)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingTask(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  document.title = "Tasks - Schedule & Manage"

  return (
    <div className="overflow-hidden pt-6">
      <motion.div
        className="mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-3xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon z-10 icon" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={getInputClasses('default', 'md', 'w-full pl-10 w-[500px] pr-4 h-13')}
              />
            </div>
            <div className="flex gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] px-5 h-13 h-13 bg-white dark:bg-black cursor-pointer dark:text-white">
                  <SelectValue   placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black ">
                  <SelectItem className={'h-10 cursor-pointer px-5'} value="all">All Status</SelectItem>
                  <SelectItem className={'h-10 cursor-pointer px-5'} value="pending">Pending</SelectItem>
                  <SelectItem className={'h-10 cursor-pointer px-5'} value="in_progress">In Progress</SelectItem>
                  <SelectItem className={'h-10 cursor-pointer px-5'} value="completed">Completed</SelectItem>
                  <SelectItem className={'h-10 cursor-pointer px-5'} value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[180px] px-5 h-13 bg-white dark:bg-black cursor-pointer dark:text-white">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black">
                  <SelectItem className={'h-10 cursor-pointer px-5'} value="all">All Priority</SelectItem>
                  <SelectItem className={'h-10 cursor-pointer px-5'} value="high">High</SelectItem>
                  <SelectItem className={'h-10 cursor-pointer px-5'} value="medium">Medium</SelectItem>
                  <SelectItem className={'h-10 cursor-pointer px-5'} value="low">Low</SelectItem>
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
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-[30px]  hover:bg-red-700 transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Trash2 className="w-4 h-4 icon icon" />
                  Delete ({selectedTasks.length})
                </motion.button>
              )}
              {
                permissions.canCreateTask &&  <Button
                onClick={() => {
                  if (!permissions.canCreateTask) {
                    toast.error('You do not have permission to create tasks. Contact an admin.');
                    return;
                  }
                  setShowNewTaskPopup(true);
                }}
                className={'w-[200px] rounded-[10px] h-12'}
              >
                Schedule Task
              </Button>
              }
             
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
      

        {/* Tasks Table */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-black rounded-[10px] shadow-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full">
              <thead className="bg-gray-100 text-black border-b dark:border-gray-700 sticky top-0 z-10">
                <tr>
                     
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Assigned BY
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs  text-black dark:text-black uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center">
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
                        <td colSpan="10" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No tasks found
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => (
                  <motion.tr
                    key={task.id}
                    className={`hover:bg-gray-50 dark:hover:bg-black transition-colors ${selectedTasks.includes(task.id) ? 'bg-gray-100 dark:bg-black' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                        
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm  text-gray-900 dark:text-white truncate">
                            {task.title}
                          </div>
                          {user && user.id && (
                            <span className={`text-xs px-2 py-1 rounded-[30px] uppercase  truncate ${
                              task.assignTo?.id === user.id 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {task.assignTo?.id === user.id ? 'to me' : 'by me'}
                            </span>
                          )}
                        </div>
                        {/* <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {task.description}
                        </div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center uppercase px-2.5 py-0.5 rounded-[30px] text-[9px]   ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`inline-flex items-center gap-1 rounded-[30px] text-[9px]  uppercase cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                            {task.status}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(task.id, 'pending')}
                            className="text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black"
                          >
                            <AlertCircle className="w-4 h-4 icon mr-2 icon" />
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(task.id, 'in_progress')}
                            className="text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black"
                          >
                            <Clock className="w-4 h-4 icon mr-2 icon" />
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(task.id, 'completed')}
                            className="text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black"
                          >
                            <CheckCircle className="w-4 h-4 icon mr-2 icon" />
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(task.id, 'cancelled')}
                            className="text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black"
                          >
                            <AlertCircle className="w-4 h-4 icon mr-2 icon" />
                            Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-6 py-4 w-[200px] rounded-[30px]">
                      <div className="flex items-center gap-3">
                        <img 
                          {...getAvatarProps(task.assignTo?.avatar, task.assignTo?.username)}
                          alt={task.assignTo?.username || "User"}
                          className="w-8 h-8 rounded-[30px] object-cover border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => task.assignTo?.id && handleUserAvatarClick(task.assignTo.id)}
                          title={task.assignTo?.username ? `View ${task.assignTo.username}'s profile` : ''}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {task.assignTo?.username || "Unknown User"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-[200px] rounded-[30px]">
                      <div className="flex items-center gap-3">
                        <img 
                          {...getAvatarProps(task.assignedBy?.avatar, task.assignedBy?.username)}
                          alt={task.assignedBy?.username || "User"}
                          className="w-8 h-8 rounded-[30px] object-cover border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => task.assignedBy?.id && handleUserAvatarClick(task.assignedBy.id)}
                          title={task.assignedBy?.username ? `View ${task.assignedBy.username}'s profile` : ''}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {task.assignedBy?.username || "Unknown User"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-[200px] rounded-[30px]">
                      {task.project ? (
                        <div className="flex items-center gap-2">
                          {/* {task.project.logo && (
                            <img 
                              src={task.project.logo.startsWith('http') ? task.project.logo : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${task.project.logo}`}
                              alt={task.project.name}
                              className="w-6 h-6 rounded object-cover"
                            />
                          )} */}
                          <span className="text-sm text-gray-900 dark:text-white truncate">
                            {task.project.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">No Project</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 icon text-gray-400 icon" />
                        <span className="text-sm text-gray-900 dark:text-white truncate">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {user && user.id && task.assignedBy?.id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task)}
                            className="p-2 text-gray-400 h-10 hover:text-black dark:hover:text-white"
                          >
                            <Edit className="w-4 h-4 icon icon" />
                          </Button>
                        )}
                        {user && user.id && task.assignedBy?.id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-gray-400 h-10 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 icon icon" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 text-gray-400 h-10 hover:text-black dark:hover:text-white"
                            >
                              <MoreVertical className="w-4 h-4 icon icon" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                            {user && user.id && task.assignedBy?.id === user.id && (
                              <DropdownMenuItem className="text-black h-12 px-5 cursor-pointer  dark:text-white hover:bg-gray-100 dark:hover:bg-black">
                                <Edit className="w-4 h-4 icon mr-2 icon" />
                                Edit Task
                              </DropdownMenuItem>
                            )}
                            {user && user.id && task.assignTo?.id === user.id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <DropdownMenuItem className="text-black h-12 px-5 cursor-pointer   dark:text-white hover:bg-gray-100 dark:hover:bg-black">
                                    <Clock className="w-4 h-4 icon mr-2 icon" />
                                    Change Status
                                  </DropdownMenuItem>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(task.id, 'pending')}
                                    className="text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black"
                                  >
                                    <AlertCircle className="w-4 h-4 icon mr-2 icon" />
                                    Pending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(task.id, 'in_progress')}
                                    className="text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black"
                                  >
                                    <Clock className="w-4 h-4 icon mr-2 icon" />
                                    In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(task.id, 'completed')}
                                    className="text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black"
                                  >
                                    <CheckCircle className="w-4 h-4 icon mr-2 icon" />
                                    Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(task.id, 'cancelled')}
                                    className="text-black dark:text-white px-5 h-10 cursor-pointer hover:bg-gray-100 dark:hover:bg-black"
                                  >
                                    <AlertCircle className="w-4 h-4 icon mr-2 icon" />
                                    Cancelled
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            {user && user.id && task.assignedBy?.id === user.id && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-600 hover:bg-red-500 hover:text-white px-5 h-12 cursor-pointer dark:hover:bg-red-900"
                              >
                                <Trash2 className="w-4 h-4 icon mr-2" />
                                Delete Task
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                      </motion.tr>
                      ))
                    )}
                  </tbody>
            </table>
          </div>
        </motion.div>

        {/* New Task Popup */}
        {showNewTaskPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0  bg-black/50 icon backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewTaskPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className=" bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="space-y-4">
                <div>
                  {/* <label className="block text-sm  text-gray-700 dark:text-gray-300 mb-2">
                    Task Title
                  </label> */}
                  <Input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  {/* <label className="block text-sm  text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label> */}
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white"
                    placeholder="Enter task description"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {/* <label className="block text-sm  text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label> */}
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger className="w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                        <SelectItem className={'h-10 cursor-pointer px-5'} value="low">Low</SelectItem>
                        <SelectItem className={'h-10 cursor-pointer px-5'} value="medium">Medium</SelectItem>
                        <SelectItem className={'h-10 cursor-pointer px-5'} value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    {/* <label className="block text-sm  text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label> */}
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  {/* <label className="block text-sm  text-gray-700 dark:text-gray-300 mb-2">
                    Assign To Person
                  </label> */}
                  <div className="relative">
                    <Input
                      type="text"
                      value={newTask.assignedTo}
                      onChange={(e) => handleAssignedToChange(e.target.value)}
                      onFocus={() => {
                        if (newTask.assignedTo.length > 0) {
                          setShowAssignedToSuggestions(true)
                        }
                      }}
                      className="w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white"
                      placeholder="Type to search users..."
                    />
                    {showAssignedToSuggestions && assignedToSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-black border-gray-200 dark:border-gray-700 rounded-[30px] shadow-lg max-h-48 overflow-y-auto">
                        {assignedToSuggestions.map((user) => (
                              <div
                                key={user.id}
                                onClick={() => selectUser(user)}
                                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 truncate cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  <img 
                                    {...getAvatarProps(user.avatar, user.username || user.name)}
                                    alt={user.username || user.name}
                                    className="w-8 h-8 rounded-[30px] object-cover border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleUserAvatarClick(user.id)
                                    }}
                                    title={user.username || user.name ? `View ${user.username || user.name}'s profile` : ''}
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{user.username || user.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                  </div>
                                </div>
                              </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {/* Project Selection */}
                  <Select value={newTask.projectId} onValueChange={(value) => setNewTask({...newTask, projectId: value})}>
                    <SelectTrigger className="w-full h-12 border-gray-200 dark:border-gray-700   bg-white dark:bg-black text-black dark:text-white">
                      <SelectValue placeholder="Select project (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                      <SelectItem className={'h-10 cursor-pointer px-5'} value="none">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem className={'h-10 cursor-pointer px-5'} key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowNewTaskPopup(false)}
                  className="flex-1 px-4 py-3 h-12 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-black"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNewTask}
                  disabled={loading}
                  className="flex-1 px-4 py-3 h-12 bg-black text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span class="loader w-5 h-5 icon"></span>
                  ) : (
                    'Assign'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

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
            setShowUserDetails(false)
            setSelectedUserId(null)
          }}
        />
      </motion.div>
    </div>
  )
}

export default Tasks
