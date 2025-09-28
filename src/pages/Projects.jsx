import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Users, 
  Link, 
  MoreVertical, 
  Filter, 
  ChevronDown,
  RefreshCw,
  Eye,
  Settings,
  UserPlus,
  ExternalLink,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  X,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Minus,
  AlertTriangle,
  Camera
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import projectService from '../services/projectService'
import friendService from '../services/friendService'
import teamService from '../services/teamService'
import { useAuth } from '../contexts/AuthContext'
import { getAvatarProps } from '../utils/avatarUtils'
import { getButtonClasses, getInputClasses, COLOR_THEME, ICON_SIZES } from '../utils/uiConstants'
import UserDetailsModal from '../components/UserDetailsModal'

const Projects = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewProjectPopup, setShowNewProjectPopup] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    teamId: '',
    members: [],
    links: [],
    tags: [],
    isPublic: false,
    logo: null
  })
  const [memberSearch, setMemberSearch] = useState('')
  const [memberSuggestions, setMemberSuggestions] = useState([])
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false)
  const [memberRole, setMemberRole] = useState('member')
  const [newLink, setNewLink] = useState({ title: '', url: '', type: 'other' })
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [projectProgress, setProjectProgress] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  console.log(projects);
  

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await projectService.getProjects({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        search: searchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit
      })
      console.log('Projects response:', response)
      console.log('Projects data:', response.projects)
      setProjects(response.projects || [])
      setPagination(response.pagination || pagination)
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterPriority, searchTerm, pagination.page, pagination.limit])

  // Load friends for member selection
  const loadUsers = useCallback(async () => {
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
          role: "Friend",
          avatar: friendship.friend.avatar
        }))
        .filter(friend => friend.id !== user?.id) // Exclude current user
      
      setUsers(transformedUsers)
    } catch (error) {
      console.error('Failed to load friends:', error)
      toast.error('Failed to load friends')
      setUsers([])
    }
  }, [user])

  // Load teams
  const loadTeams = useCallback(async () => {
    try {
      const response = await teamService.getTeams({ limit: 100 })
      setTeams(response.teams || [])
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
  }, [])

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await projectService.getProjectStats()
      setStats(response.stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadProjects()
    loadUsers()
    loadTeams()
    loadStats()
  }, [loadProjects, loadUsers, loadTeams, loadStats])

  // Handle member search
  const handleMemberSearch = (value) => {
    setMemberSearch(value)
    if (value.length > 0) {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(value.toLowerCase()) &&
        !newProject.members.some(member => member.id === user.id)
      )
      setMemberSuggestions(filtered)
      setShowMemberSuggestions(true)
    } else {
      setMemberSuggestions([])
      setShowMemberSuggestions(false)
    }
  }

  // Add member
  const handleAddMember = (user) => {
    if (!newProject.members.some(member => member.id === user.id)) {
      setNewProject(prev => ({
        ...prev,
        members: [...prev.members, { id: user.id, username: user.username, avatar: user.avatar }]
      }))
      setMemberSearch('')
      setShowMemberSuggestions(false)
    }
  }

  // Remove member
  const handleRemoveMember = (userId) => {
    setNewProject(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== userId)
    }))
  }

  // Add link
  const handleAddLink = () => {
    if (newLink.title && newLink.url) {
      setNewProject(prev => ({
        ...prev,
        links: [...prev.links, { ...newLink, id: Date.now().toString() }]
      }))
      setNewLink({ title: '', url: '', type: 'other' })
    }
  }

  // Remove link
  const handleRemoveLink = (linkId) => {
    setNewProject(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== linkId)
    }))
  }

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !newProject.tags.includes(newTag.trim())) {
      setNewProject(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setNewProject(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Create project
  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProject.name.trim()) {
      toast.error('Project name is required')
      return
    }

    try {
      setLoading(true)
      
      // Handle logo upload if present
      let logoUrl = null
      if (newProject.logo) {
        const formData = new FormData()
        formData.append('logo', newProject.logo)
        formData.append('folder', 'projects')
        
        const uploadResponse = await fetch('http://localhost:4000/api/projects/upload/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          logoUrl = uploadData.url
        }
      }
      
      const projectData = {
        ...newProject,
        logo: logoUrl,
        members: newProject.members.map(member => member.id)
      }
      
      const response = await projectService.createProject(projectData)
      setProjects(prev => [response.project, ...prev])
      setShowNewProjectPopup(false)
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        members: [],
        links: [],
        tags: [],
        isPublic: false,
        logo: null
      })
      toast.success('Project created successfully!')
      loadStats()
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error(error.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  // Delete project
  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await projectService.deleteProject(projectId)
      setProjects(prev => prev.filter(project => project.id !== projectId))
      toast.success('Project deleted successfully!')
      loadStats()
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error(error.message || 'Failed to delete project')
    }
  }

  // View project details
  const handleViewProject = async (project) => {
    try {
      // Fetch full project details with populated tasks and meetings
      const response = await projectService.getProjectById(project.id)
      console.log('=== FRONTEND PROJECT DEBUG START ===')
      console.log('Full project data:', response.project)
      console.log('Project tasks:', response.project.tasks)
      console.log('Project meetings:', response.project.meetings)
      console.log('Tasks length:', response.project.tasks?.length || 0)
      console.log('Meetings length:', response.project.meetings?.length || 0)
      console.log('=== FRONTEND PROJECT DEBUG END ===')
      setSelectedProject(response.project)
      setShowProjectDetails(true)
    } catch (error) {
      console.error('Error fetching project details:', error)
      toast.error('Failed to load project details')
    }
  }

  // Handle user avatar click
  const handleUserAvatarClick = (userId) => {
    console.log('Avatar clicked for user ID:', userId)
    setSelectedUserId(userId)
    setShowUserDetails(true)
    console.log('Modal should open now')
  }

  // Update project progress
  const handleUpdateProgress = async () => {
    if (!selectedProject) return

    try {
      await projectService.updateProject(selectedProject.id, {
        progress: projectProgress
      })
      
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id 
          ? { ...project, progress: projectProgress }
          : project
      ))
      
      setSelectedProject(prev => ({ ...prev, progress: projectProgress }))
      setShowProgressModal(false)
      toast.success('Project progress updated!')
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error(error.message || 'Failed to update progress')
    }
  }

  // Add member to project
  const handleAddMemberToProject = async (userId, role = 'member') => {
    if (!selectedProject) return

    try {
      await projectService.addMember(selectedProject.id, { userId, role })
      
      // Reload project details
      const response = await projectService.getProjectById(selectedProject.id)
      setSelectedProject(response.project)
      
      // Update projects list
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id ? response.project : project
      ))
      
      toast.success('Member added successfully!')
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error(error.message || 'Failed to add member')
    }
  }

  // Remove member from project
  const handleRemoveMemberFromProject = async (userId) => {
    if (!selectedProject) return

    try {
      await projectService.removeMember(selectedProject.id, { userId })
      
      // Reload project details
      const response = await projectService.getProjectById(selectedProject.id)
      setSelectedProject(response.project)
      
      // Update projects list
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id ? response.project : project
      ))
      
      toast.success('Member removed successfully!')
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error(error.message || 'Failed to remove member')
    }
  }

  // Add link to project
  const handleAddLinkToProject = async (linkData) => {
    if (!selectedProject) return

    try {
      await projectService.addLink(selectedProject.id, linkData)
      
      // Reload project details
      const response = await projectService.getProjectById(selectedProject.id)
      setSelectedProject(response.project)
      
      // Update projects list
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id ? response.project : project
      ))
      
      toast.success('Link added successfully!')
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error(error.message || 'Failed to add link')
    }
  }

  // Remove link from project
  const handleRemoveLinkFromProject = async (linkId) => {
    if (!selectedProject) return

    try {
      await projectService.removeLink(selectedProject.id, { linkId })
      
      // Reload project details
      const response = await projectService.getProjectById(selectedProject.id)
      setSelectedProject(response.project)
      
      // Update projects list
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id ? response.project : project
      ))
      
      toast.success('Link removed successfully!')
    } catch (error) {
      console.error('Error removing link:', error)
      toast.error(error.message || 'Failed to remove link')
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200'
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200'
    }
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200'
    }
  }

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low': return <ArrowDown className="w-3 h-3 icon" />
      case 'medium': return <Minus className="w-3 h-3 icon" />
      case 'high': return <ArrowUp className="w-3 h-3 icon" />
      case 'urgent': return <AlertTriangle className="w-3 h-3 icon" />
      default: return <Minus className="w-3 h-3 icon" />
    }
  }

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'No date'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      return date.toLocaleDateString()
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4 icon" />
      case 'active': return <CheckCircle className="w-4 h-4 icon" />
      case 'on_hold': return <Pause className="w-4 h-4 icon" />
      case 'completed': return <CheckCircle className="w-4 h-4 icon" />
      case 'cancelled': return <X className="w-4 h-4 icon" />
      default: return <Clock className="w-4 h-4 icon" />
    }
  }

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  console.log(filteredProjects);
  

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="overflow-hidden pt-6 pl-6 pb-10">
      <motion.div
        className="mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your projects and collaborate with your team</p>
          </div>
          <div className="flex items-center gap-4">
            
            <Button
              onClick={() => setShowNewProjectPopup(true)}
            className={'w-[200px] rounded-xl rounded-xl h-12'}

            >
              <Plus className={ICON_SIZES.sm} />
              New Project
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-black rounded-full">
                  <CheckCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 icon" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeProjects}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 icon" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedProjects}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-black rounded-full">
                  <CheckCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 icon" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Progress</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageProgress}%</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400 icon" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-start items-center gap-4 mb-6">
          <div className="">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={getInputClasses('default', 'md', 'pl-10 w-[350px] h-13')}
              />
            </div>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-white dark:bg-black h-13">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="all">All Status</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="planning">Planning</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="active">Active</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="on_hold">On Hold</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="completed">Completed</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40 bg-white dark:bg-black h-13">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="all">All Priority</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="low">Low</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="medium">Medium</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="high">High</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Projects Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                </div>
              </div>
            ))
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <CheckCircle className="w-16 h-16 mx-auto icon" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first project</p>
              <Button
                onClick={() => setShowNewProjectPopup(true)}
              >
                <Plus className="w-4 h-4 mr-2 icon" />
                Create Project
              </Button>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="dark:bg-gray-900 rounded-lg bg-white border  p-6 transition-shadow duration-300"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 h-12">
                    <div className="flex items-center gap-3 mb-2">
                      {project.logo && (
                        <img
                          src={project.logo.startsWith('http') ? project.logo : `http://localhost:4000${project.logo}`}
                          alt={project.name}
                          className="w-8 h-8 rounded object-cover border border-gray-200 dark:border-gray-700"
                        />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {project.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProject(project)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-12"
                    >
                      <Eye className="w-4 h-4 icon" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project)
                        setProjectProgress(project.progress || 0)
                        setShowProgressModal(true)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-12"
                    >
                      <TrendingUp className="w-4 h-4 icon" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-2">
                          <MoreVertical className="w-4 h-4 icon" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="h-10 px-5 cursor-pointer" onClick={() => handleViewProject(project)}>
                          <Eye className="w-4 h-4 mr-2 icon" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-10 px-5 cursor-pointer">
                          <Edit className="w-4 h-4 mr-2 icon" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-10 px-5 cursor-pointer" onClick={() => {
                          setSelectedProject(project)
                          setShowMembersModal(true)
                        }}>
                          <Users className="w-4 h-4 mr-2 icon" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-10 px-5 cursor-pointer" onClick={() => {
                          setSelectedProject(project)
                          setShowLinksModal(true)
                        }}>
                          <Link className="w-4 h-4 mr-2 icon" />
                          Manage Links
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-10 px-5 cursor-pointer text-red-600" 
                          onClick={() => handleDeleteProject(project.id)}
                       
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Team Info */}
                {project.teamId && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <Users className="w-4 h-4 icon" />
                      <span>Team: {project.teamId.name}</span>
                    </div>
                  </div>
                )}

                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{project?.members.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 icon" />
                    <span>{project?.tasks.length || 0} tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 icon" />
                    <span>{project?.meetings.length || 0} meetings</span>
                  </div>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 rounded-full text-xs"
                      >
                        <Tag className="w-3 h-3 mr-1 icon" />
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{project.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Project Footer */}
                <div className="flex items-center justify-between pt-4 border-t icon border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {project.members?.slice(0, 3).map((member, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => handleUserAvatarClick(member.user._id)}
                          title={member.user.username}
                        >
                          <img
                            {...getAvatarProps(member.user.avatar, member.user.username)}
                            alt={member.user.username}
                            className="w-full h-full object-cover"
                          />
                         
                        </div>
                      ))}
                      {project.members?.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-black flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* New Project Popup */}
        {showNewProjectPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewProjectPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h2>
                <button
                  onClick={() => setShowNewProjectPopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6 icon" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-2">
                {/* Project Name and Description */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Input
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="Project name *"
                      className="w-full h-12 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Project description *"
                      className="w-full h-12 rounded-lg"
                      rows="3"
                      required
                    />
                  </div>
                  <div>
                    <Select value={newProject.teamId || "none"} onValueChange={(value) => setNewProject({...newProject, teamId: value === "none" ? "" : value})}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select Team (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="none">No Team</SelectItem>
                        {teams.map((team) => (
                          <SelectItem className={'px-5 h-10 cursor-pointer'} key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Project Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Logo (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    {newProject.logo ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(newProject.logo)}
                          alt="Project logo preview"
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => setNewProject({...newProject, logo: null})}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            setNewProject({...newProject, logo: file})
                          }
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {newProject.logo ? 'Change Logo' : 'Upload Logo'}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Recommended: 200x200px, PNG or JPG
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status, Priority, and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select value={newProject.status} onValueChange={(value) => setNewProject({...newProject, status: value})}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="planning">Planning</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="active">Active</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="on_hold">On Hold</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="completed">Completed</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={newProject.priority} onValueChange={(value) => setNewProject({...newProject, priority: value})}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="low">Low</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="medium">Medium</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="high">High</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                      placeholder="Start date *"
                      className="w-full h-12 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                      placeholder="End date"
                      className="w-full h-12 rounded-lg"
                    />
                  </div>
                </div>

                {/* Members */}
                <div>
                  <div className="relative mb-3">
                    <Input
                      value={memberSearch}
                      onChange={(e) => handleMemberSearch(e.target.value)}
                      placeholder="Add team members"
                      className="w-full h-12 rounded-lg"
                    />
                    {showMemberSuggestions && memberSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {memberSuggestions.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleAddMember(user)}
                            className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                {...getAvatarProps(user.avatar, user.username)}
                                alt={user.username}
                                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                              />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.username}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {newProject.members.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newProject.members.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 rounded-full text-sm"
                        >
                          <img
                            {...getAvatarProps(member.avatar, member.username)}
                            alt={member.username}
                            className="w-4 h-4 rounded-full"
                          />
                          {member.username}
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="ml-1 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newLink.title}
                      onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                      placeholder="Link title"
                      className="flex-1 h-12 rounded-lg"
                    />
                    <Input
                      value={newLink.url}
                      onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                      placeholder="URL"
                      className="flex-1 h-12 rounded-lg"
                    />
                    <Select value={newLink.type} onValueChange={(value) => setNewLink({...newLink, type: value})}>
                      <SelectTrigger className="w-32 h-12 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="repository">Repository</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="documentation">Documentation</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="design">Design</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" className={'h-12 w-12'} onClick={handleAddLink} variant="outline">
                      <Plus />
                    </Button>
                  </div>
                  
                  {newProject.links.length > 0 && (
                    <div className="space-y-2">
                      {newProject.links.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-black rounded">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">{link.title}</span>
                            <span className="text-xs text-gray-500">({link.type})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(link.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-1 h-12 rounded-lg"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  
                  {newProject.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newProject.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Public Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newProject.isPublic}
                    onChange={(e) => setNewProject({...newProject, isPublic: e.target.checked})}
                    className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 dark:focus:ring-gray-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                    Make this project public
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t icon border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewProjectPopup(false)}
                    className="flex-1 h-12 rounded-lg"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 disabled:opacity-50 h-12 disabled:cursor-not-allowed rounded-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loader w-5 h-5"></span>
                    ) : (
                      'Create Project'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {
          console.log(selectedProject)
        }

        {/* Project Details Modal */}
        {showProjectDetails && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-100000"
            onClick={() => setShowProjectDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedProject.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Created by {selectedProject.createdBy?.username} • {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowProjectDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6 icon" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Project Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedProject.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                          {getStatusIcon(selectedProject.status)}
                          {selectedProject.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedProject.priority)}`}>
                          {getPriorityIcon(selectedProject.priority)}
                          {selectedProject.priority}
                        </span>
                      </div>
                    </div>

                    {selectedProject.teamId && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team</h4>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4 icon" />
                          <span>{selectedProject.teamId.name}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Progress</h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedProject.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedProject.progress || 0}% complete
                      </p>
                    </div>

                    {selectedProject.tags && selectedProject.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Members and Links */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Members ({selectedProject.members?.length || 0})</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedProject.members?.map((member, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-black rounded-lg">
                            <div className="flex items-center gap-2">
                              <img
                                {...getAvatarProps(member.user?.avatar, member.user?.username)}
                                alt={member.user?.username}
                                className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => handleUserAvatarClick(member.user?.id)}
                                title={`View ${member.user?.username}'s profile`}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {member.user?.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Links ({selectedProject.links?.length || 0})</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedProject.links?.map((link, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-black rounded-lg">
                            <div className="flex items-center gap-2">
                              <Link className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {link.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {link.type}
                                </p>
                              </div>
                            </div>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-gray-600 text-sm"
                            >
                              Open
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tasks and Meetings Section */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tasks */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Tasks ({selectedProject.tasks?.length || 0})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedProject.tasks?.length > 0 ? (
                        selectedProject.tasks.map((task, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                task.status === 'completed' ? 'bg-green-500' :
                                task.status === 'in_progress' ? 'bg-gray-500' :
                                task.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {task.title || 'Untitled Task'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Assigned to {task.assignTo?.username || 'Unknown'} • {task.priority || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              task.status === 'in_progress' ? 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200' :
                              task.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {task.status ? task.status.replace('_', ' ') : 'Unknown'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No tasks assigned to this project</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meetings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 icon" />
                      Meetings ({selectedProject.meetings?.length || 0})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedProject.meetings?.length > 0 ? (
                        selectedProject.meetings.map((meeting, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                meeting.status === 'completed' ? 'bg-green-500' :
                                meeting.status === 'scheduled' ? 'bg-gray-500' :
                                meeting.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {meeting.title || 'Untitled Meeting'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {meeting.type || 'Unknown'} • {formatDate(meeting.startDate)}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              meeting.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              meeting.status === 'scheduled' ? 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200' :
                              meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {meeting.status || 'Unknown'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No meetings scheduled for this project</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4  icon border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => {
                      setProjectProgress(selectedProject.progress || 0)
                      setShowProgressModal(true)
                    }}
                    className="flex-1 h-12 rounded-lg"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Update Progress
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMembersModal(true)
                    }}
                    className="flex-1 h-12 rounded-lg"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Members
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLinksModal(true)
                    }}
                    className="flex-1 h-12 rounded-lg"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Manage Links
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleViewProject(selectedProject)}
                    className="flex-1 h-12 rounded-lg"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Progress Update Modal */}
        {showProgressModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowProgressModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Progress
                </h2>
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6 icon" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Progress: {projectProgress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={projectProgress}
                    onChange={(e) => setProjectProgress(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowProgressModal(false)}
                    className="flex-1 h-12 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateProgress}
                    className="flex-1 h-12 rounded-lg"
                  >
                    Update Progress
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Members Management Modal */}
        {showMembersModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowMembersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Manage Members
                  </h2>
                  <button
                    onClick={() => setShowMembersModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6 icon" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Add Member */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Add Member</h3>
                    <div className="flex gap-2">
                      <Input
                        value={memberSearch}
                        onChange={(e) => {
                          setMemberSearch(e.target.value)
                          if (e.target.value.length > 0) {
                            const filtered = users.filter(user => 
                              user.username.toLowerCase().includes(e.target.value.toLowerCase()) &&
                              !selectedProject.members?.some(member => member.user?.id === user.id)
                            )
                            setMemberSuggestions(filtered)
                            setShowMemberSuggestions(true)
                          } else {
                            setShowMemberSuggestions(false)
                          }
                        }}
                        placeholder="Search users..."
                        className="flex-1 h-12 rounded-lg"
                      />
                      <Select value={memberRole} onValueChange={setMemberRole}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="member">Member</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="admin">Admin</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {showMemberSuggestions && memberSuggestions.length > 0 && (
                      <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-black max-h-40 overflow-y-auto">
                        {memberSuggestions.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              handleAddMemberToProject(user.id, memberRole)
                              setMemberSearch('')
                              setShowMemberSuggestions(false)
                            }}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            <img
                              {...getAvatarProps(user.avatar, user.username)}
                              alt={user.username}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">{user.username}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Current Members */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Current Members</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedProject.members?.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              {...getAvatarProps(member.user?.avatar, member.user?.username)}
                              alt={member.user?.username}
                              className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => handleUserAvatarClick(member.user?.id)}
                              title={`View ${member.user?.username}'s profile`}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.user?.username}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {member.role} • Joined {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMemberFromProject(member.user?.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Links Management Modal */}
        {showLinksModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowLinksModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Manage Links
                  </h2>
                  <button
                    onClick={() => setShowLinksModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6 icon" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Add Link */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Add Link</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={newLink.title}
                        onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                        placeholder="Link title"
                      />
                      <Input
                        value={newLink.url}
                        onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                        placeholder="URL"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Select value={newLink.type} onValueChange={(value) => setNewLink({...newLink, type: value})}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="repository">Repository</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="documentation">Documentation</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="design">Design</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => {
                          if (newLink.title && newLink.url) {
                            handleAddLinkToProject(newLink)
                            setNewLink({ title: '', url: '', type: 'other' })
                          }
                        }}
                        className="flex-1 h-12 rounded-lg"
                      >
                        Add Link
                      </Button>
                    </div>
                  </div>

                  {/* Current Links */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Current Links</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedProject.links?.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-lg">
                          <div className="flex items-center gap-3">
                            <Link className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {link.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {link.type} • {link.url}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-gray-600 text-sm"
                            >
                              Open
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLinkFromProject(link._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

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

export default Projects
