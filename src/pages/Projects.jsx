import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
// @ts-ignore
import HorizontalLoader from '../components/HorizontalLoader'
import { usePermissions } from '../hooks/usePermissions'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  // @ts-ignore
  Users, 
  Link, 
  MoreVertical, 
  // @ts-ignore
  Filter, 
  ChevronDown,
  RefreshCw,
  Eye,
  Settings,
  // @ts-ignore
  UserPlus,
  ExternalLink,
  Tag,
  Clock,
  CheckCircle,
  // @ts-ignore
  AlertCircle,
  Pause,
  X,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Minus,
  AlertTriangle,
  Camera,
  // @ts-ignore
  ArrowUpRight,
  ArrowUpRightSquare,
  Folder
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
import { useNotifications } from '../contexts/NotificationContext'
import { getAvatarProps } from '../utils/avatarUtils'
// @ts-ignore
import { getButtonClasses, getInputClasses, COLOR_THEME, ICON_SIZES } from '../utils/uiConstants'
import UserDetailsModal from '../components/UserDetailsModal'
import { PiUsersDuotone } from 'react-icons/pi'

const Projects = () => {
  const { user } = useAuth()
  const { markAsReadByType } = useNotifications()
  // @ts-ignore
  const { permissions, loading: permissionsLoading } = usePermissions()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewProjectPopup, setShowNewProjectPopup] = useState(false)
  // @ts-ignore
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
  // @ts-ignore
  const [memberRole, setMemberRole] = useState('member')
  
  // Separate state for project details modal member search
  const [projectMemberSearch, setProjectMemberSearch] = useState('')
  const [projectMemberSuggestions, setProjectMemberSuggestions] = useState([])
  const [showProjectMemberSuggestions, setShowProjectMemberSuggestions] = useState(false)
  const [projectMemberRole, setProjectMemberRole] = useState('member')
  const [newLink, setNewLink] = useState({ title: '', url: '', type: 'other' })
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  // @ts-ignore
  const [stats, setStats] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [projectProgress, setProjectProgress] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showTasks, setShowTasks] = useState(false)
  const [showMeetings, setShowMeetings] = useState(false)
  const [showLinks, setShowLinks] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 0
  })

  console.log(projects);
  

  // Load projects
  // @ts-ignore
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

  // Reset pagination when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [filterStatus, filterPriority, searchTerm])

  // Load friends for member selection
  // @ts-ignore
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
  // @ts-ignore
  const loadTeams = useCallback(async () => {
    try {
      const response = await teamService.getTeams({ limit: 100 })
      setTeams(response.teams || [])
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
  }, [])

  // Load stats
  // @ts-ignore
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

  // Mark project notifications as read when user visits this page
  useEffect(() => {
    if (user && user.id) {
      markAsReadByType('projects')
    }
  }, [user, markAsReadByType])

  // Debug selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      console.log('selectedProject updated:', selectedProject)
      console.log('selectedProject members count:', selectedProject.members?.length)
      console.log('selectedProject members:', selectedProject.members)
    }
  }, [selectedProject])

  // Debug projects list changes
  useEffect(() => {
    if (projects.length > 0) {
      console.log('Projects list updated:', projects.length, 'projects')
      projects.forEach(project => {
        console.log(`Project ${project.name} (${project.id}) members:`, project.members?.length)
      })
    }
  }, [projects])

  // Handle member search for new project form
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

  // Handle member search for project details modal
  const handleProjectMemberSearch = (value) => {
    setProjectMemberSearch(value)
    if (value.length > 0) {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(value.toLowerCase()) &&
        !selectedProject?.members?.some(member => member.user?._id === user.id)
      )
      setProjectMemberSuggestions(filtered)
      setShowProjectMemberSuggestions(true)
    } else {
      setProjectMemberSuggestions([])
      setShowProjectMemberSuggestions(false)
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
    // @ts-ignore
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
  // @ts-ignore
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
        
        // @ts-ignore
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const uploadResponse = await fetch(`${apiUrl}/api/projects/upload/projects`, {
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
      // @ts-ignore
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
  // @ts-ignore
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
  // @ts-ignore
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

  // Check if current user is project owner
  const isProjectOwner = (project) => {
    return project.createdBy?.id === user?.id || project.createdBy?._id === user?.id
  }

  // Update project progress
  // @ts-ignore
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
  // @ts-ignore
  const handleAddMemberToProject = async (userId, role = 'member') => {
    if (!selectedProject) return

    try {
      setLoading(true)
      console.log('Adding member:', userId, 'to project:', selectedProject.id)
      
      await projectService.addMember(selectedProject.id, { userId, role })
      
      // Reload projects to get updated data
      console.log('Reloading projects after adding member...')
      await loadProjects()
      
      // Update selected project if it's the current project
      if (selectedProject) {
        console.log('Fetching updated project data for:', selectedProject.id)
        const response = await projectService.getProjectById(selectedProject.id)
        console.log('Updated project data:', response.project)
        console.log('Updated project members count:', response.project.members.length)
        console.log('Updated project members:', response.project.members)
        
        // Check if the project in the projects list has the same data
        // @ts-ignore
        const projectInList = projects.find(p => p.id === selectedProject.id)
        console.log('Project in list members count:', projectInList?.members?.length)
        console.log('Project in list members:', projectInList?.members)
        
        setSelectedProject(response.project)
        setRefreshKey(prev => prev + 1)
      }
      
      setProjectMemberSearch('')
      setShowProjectMemberSuggestions(false)
      setProjectMemberSuggestions([])
      toast.success('Member added successfully!')
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error(error.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  // Remove member from project
  // @ts-ignore
  const handleRemoveMemberFromProject = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      setLoading(true)
      console.log('Removing member:', userId, 'from project:', selectedProject.id)
      
      await projectService.removeMember(selectedProject.id, { userId })
      
      // Reload projects to get updated data
      console.log('Reloading projects after removing member...')
      await loadProjects()
      
      // Update selected project if it's the current project
      if (selectedProject) {
        console.log('Fetching updated project data for:', selectedProject.id)
        const response = await projectService.getProjectById(selectedProject.id)
        console.log('Updated project data:', response.project)
        console.log('Updated project members count:', response.project.members.length)
        console.log('Updated project members:', response.project.members)
        console.log('Previous selectedProject members count:', selectedProject.members.length)
        
        // Check if the project in the projects list has the same data
        // @ts-ignore
        const projectInList = projects.find(p => p.id === selectedProject.id)
        console.log('Project in list members count:', projectInList?.members?.length)
        console.log('Project in list members:', projectInList?.members)
        
        setSelectedProject(response.project)
        
        // Force a re-render by updating the refresh key
        setRefreshKey(prev => prev + 1)
        
        // Force a re-render by updating the state
        setTimeout(() => {
          console.log('After timeout - selectedProject members:', selectedProject.members.length)
        }, 100)
      }
      
      // Clear project member search and suggestions
      setProjectMemberSearch('')
      setShowProjectMemberSuggestions(false)
      setProjectMemberSuggestions([])
      
      toast.success('Member removed successfully!')
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error(error.message || 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  // Add link to project
  // @ts-ignore
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
  // @ts-ignore
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

  document.title = "Projects - Manage Projects at ease!"

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
      case 'low': return <ArrowDown className="w-3 h-3 icon icon" />
      case 'medium': return <Minus className="w-3 h-3 icon icon" />
      case 'high': return <ArrowUp className="w-3 h-3 icon icon" />
      case 'urgent': return <AlertTriangle className="w-3 h-3 icon icon" />
      default: return <Minus className="w-3 h-3 icon icon" />
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
      case 'planning': return <Clock className="w-4 h-4 icon icon" />
      case 'active': return <CheckCircle className="w-4 h-4 icon icon" />
      case 'on_hold': return <Pause className="w-4 h-4 icon icon" />
      case 'completed': return <CheckCircle className="w-4 h-4 icon icon" />
      case 'cancelled': return <X className="w-4 h-4 icon icon" />
      default: return <Clock className="w-4 h-4 icon icon" />
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

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // @ts-ignore
  const handlePageSizeChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))
  }

  const getPageNumbers = () => {
    const { page, pages } = pagination
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i)
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (page + delta < pages - 1) {
      rangeWithDots.push('...', pages)
    } else if (pages > 1) {
      rangeWithDots.push(pages)
    }

    return rangeWithDots
  }

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
    <div className="overflow-hidden pb-10 pt-10">
      <motion.div
        className="mx-auto"
    
      >
         <div className="flex py-6 gap-3 items-center fixed z-10 -top-3 z-10">
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
        <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
                  <Folder  size={15} />
                  </div>
                  <h1 className="text-2xl font-bold">My Projects</h1>
                </div>
      </div>
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div>
          <motion.div variants={itemVariants} className="flex flex-wrap justify-start items-center gap-4 ">
          <div className="">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon icon" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={getInputClasses('default', 'md', 'pl-10 w-[500px] h-13')}
              />
            </div>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 px-5 cursor-pointer bg-white dark:bg-black h-13">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <
// @ts-ignore
            SelectContent>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="all">All Status</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="planning">Planning</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="active">Active</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="on_hold">On Hold</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="completed">Completed</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40 bg-white px-5 cursor-pointer dark:bg-black h-13">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <
// @ts-ignore
            SelectContent>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="all">All Priority</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="low">Low</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="medium">Medium</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="high">High</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
              </div>
          <div className="flex items-center gap-4">

            {
              // @ts-ignore
              permissions.canCreateProject &&       <Button
              onClick={() => {
                if (!permissions.canCreateProject) {
                  toast.error('You do not have permission to create projects. Contact an admin.');
                  return;
                }
                setShowNewProjectPopup(true);
              }}
              className={'w-[200px] rounded-[10px] rounded-[10px] h-12 font-bold'}
            >
              New Project
            </Button>
            }
            
      
          </div>
        </motion.div>

        {/* Stats Cards */}
    
        {/* Filters */}
        

        {/* Projects Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // @ts-ignore
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-black rounded-[10px]  border-gray-200 dark:border-gray-700 p-6 animate-pulse">
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
             
              <h3 className="text-xl  text-gray-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first project</p>
              <
// @ts-ignore
              Button
                onClick={() => {
                  if (!permissions.canCreateProject) {
                    toast.error('You do not have permission to create projects. Contact an admin.');
                    return;
                  }
                  setShowNewProjectPopup(true);
                }}
                disabled={!permissions.canCreateProject}
                className={'w-[200px]'}
              >
                <Plus className="w-4 h-4 icon mr-2 icon" />
                Create Project
              </Button>
            </div>
          ) : (
          filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="dark:bg-[rgba(255,255,255,.1)] rounded-[20px] bg-white dark:border-none border  p-6 transition-shadow duration-300"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 h-12">
                    <div className="flex items-center gap-3 mb-2">
                      {project.logo && (
                        <img
                          // @ts-ignore
                          src={project.logo.startsWith('http') ? project.logo : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${project.logo}`}
                          alt={project.name}
                          className="w-8 h-8 rounded object-cover rounded-[10px] bg-gray-100  border border-gray-200 dark:border-gray-700"
                        />
                      )}
                      <h3 className="text-lg  text-gray-900 dark:text-white font-bold line-clamp-1">
                        {project.name}
                      </h3>
                    </div>
                    {/* <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {project.description}
                    </p> */}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProject(project)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-12"
                    >
                      <Eye className="w-4 h-4 icon icon" />
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
                      <TrendingUp className="w-4 h-4 icon icon" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-2 w-12">
                          <MoreVertical className="w-4 h-4 icon icon" />
                        </Button>
                      </DropdownMenuTrigger>
                      <
// @ts-ignore
                      DropdownMenuContent align="end">
                        <
// @ts-ignore
                        DropdownMenuItem className="h-10 px-5 cursor-pointer" onClick={() => handleViewProject(project)}>
                          <Eye className="w-4 h-4 icon mr-2 icon" />
                          View Details
                        </DropdownMenuItem>
                        {isProjectOwner(project) && (
                          <>
                            <
// @ts-ignore
                            DropdownMenuItem className="h-10 px-5 cursor-pointer">
                              <Edit className="w-4 h-4 icon mr-2 icon" />
                              Edit Project
                            </DropdownMenuItem>
                            <
// @ts-ignore
                            DropdownMenuItem className="h-10 px-5 cursor-pointer" onClick={() => {
                              setSelectedProject(project)
                              setShowMembersModal(true)
                            }}>
                              <Settings className="w-4 h-4 icon mr-2 icon" />
                              Edit Members
                            </DropdownMenuItem>
                            <
// @ts-ignore
                            DropdownMenuItem className="h-10 px-5 cursor-pointer" onClick={() => {
                              setSelectedProject(project)
                              setShowLinksModal(true)
                            }}>
                              <Link className="w-4 h-4 icon mr-2 icon" />
                              Manage Links
                            </DropdownMenuItem>
                            <
// @ts-ignore
                            DropdownMenuItem className="h-10 px-5 cursor-pointer text-red-600" 
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="w-4 h-4 icon mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex gap-2 mb-4">
                  <span className={`inline-flex items-center border gap-1 uppercase px-4 py-2 rounded-[10px] text-[10px] font-medium ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center  px-4 py-2 border uppercase rounded-[10px] text-[10px] font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-[10px] h-2">
                    <div 
                      className="bg-black dark:bg-white h-2 rounded-[10px] transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Team Info */}
                {/* {project.teamId && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <Users className="w-4 h-4 icon icon" />
                      <span>Team: {project.teamId.name}</span>
                    </div>
                  </div>
                )} */}

                {/* Project Stats */}
                {/* <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 col-span-2 dark:text-gray-400">
                    
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 icon icon" />
                    <span>{project?.tasks.length || 0} tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 icon icon" />
                    <span>{project?.meetings.length || 0} meetings</span>
                  </div>
                </div> */}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-4 justify-start items-center mb-4">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 rounded-[10px] text-xs"
                      >
                        <Tag className="w-3 h-3 icon mr-1 icon" />
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
                          className="w-10 h-10 rounded-[10px]  border-white dark:border-gray-900 overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => handleUserAvatarClick(member.user._id)}
                          title={member.user.username}
                        >
                          <img
                            {...getAvatarProps(member.user.avatar, member.user.username)}
                            alt={member.user.username}
                            className="w-full h-full object-cover rounded-[20px]"
                          />
                         
                        </div>
                      ))}
                      {project.members?.length > 3 && (
                        <div className="w-6 h-6 rounded-[10px]  border-white dark:border-gray-900 bg-gray-100 dark:bg-black flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
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

        {/* Pagination Controls - Fixed at Bottom */}
        <div className="sticky bottom-0  border-gray-200 dark:border-gray-700 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-end gap-4"
          >
          {/* Page Info */}
          

          {/* Pagination Buttons - Only show if more than 1 page */}
          {pagination.pages > 1 && (
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="flex items-center gap-1 h-8 px-3  w-[120px] h-[50px]"
              >
                <ArrowUp className="w-4 h-4 icon rotate-[-90deg]" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, index) => (
                  <div key={index}>
                    {pageNum === '...' ? (
                      <span className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                      <Button
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`h-8 w-8 p-0 ${
                          pagination.page === pageNum 
                            ? 'bg-gray-600 text-white hover:bg-gray-700' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || loading}
                className="flex items-center gap-1 h-8 w-[120px] h-[50px]"
              >
                Next
                <ArrowDown className="w-4 h-4 icon rotate-[-90deg]" />
              </Button>
            </div>
          )}
        </motion.div>
        </div>

        {/* Loading Overlay for Pagination */}
        

        {/* New Project Popup */}
        {showNewProjectPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/50 icon  bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewProjectPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black rounded-[20px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
            

              <form onSubmit={handleCreateProject} className="space-y-2">
                {/* Project Name and Description */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <
// @ts-ignore
                    Input
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="Project name *"
                      className="w-full h-12 rounded-[10px]"
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      // @ts-ignore
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Project description *"
                      className="w-full h-12 rounded-[10px]"
                      rows="3"
                      required
                    />
                  </div>
                  <div>
                    <Select value={newProject.teamId || "none"} onValueChange={(value) => setNewProject({...newProject, teamId: value === "none" ? "" : value})}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select Team (Optional)" />
                      </SelectTrigger>
                      <
// @ts-ignore
                      SelectContent>
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
                
                  <div className="flex items-center gap-4">
                    {newProject.logo ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(newProject.logo)}
                          alt="Project logo preview"
                          className="w-16 h-16 rounded-[10px] object-cover  border-gray-200 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => setNewProject({...newProject, logo: null})}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-[10px] flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3 icon" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border dark:border-gray-600 rounded-[10px] flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400 icon" />
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
                        className="cursor-pointer border inline-flex items-center px-10 py-5 border border-gray-300 dark:border-gray-600 rounded-[10px] shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Camera className="w-4 h-4 icon mr-2 icon" />
                        {newProject.logo ? 'Change Logo' : 'Upload Logo'}
                      </label>
                    
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
                      <
// @ts-ignore
                      SelectContent>
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
                      <
// @ts-ignore
                      SelectContent>
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
                      className="w-full h-12 rounded-[10px]"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                      placeholder="End date"
                      className="w-full h-12 rounded-[10px]"
                    />
                  </div>
                </div>

                {/* Members */}
                <div>
                  <div className="relative mb-3">
                    <
// @ts-ignore
                    Input
                      value={memberSearch}
                      onChange={(e) => handleMemberSearch(e.target.value)}
                      placeholder="Add team members"
                      className="w-full h-12 rounded-[10px]"
                    />
                    {showMemberSuggestions && memberSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 rounded-[10px] shadow-lg max-h-48 overflow-y-auto">
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
                                className="w-8 h-8 rounded-[10px] object-cover  border-gray-200 dark:border-gray-700"
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
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 rounded-[10px] text-sm"
                        >
                          <img
                            {...getAvatarProps(member.avatar, member.username)}
                            alt={member.username}
                            className="w-4 h-4 icon rounded-[10px]"
                          />
                          {member.username}
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="ml-1 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="w-3 h-3 icon" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div>
                  <div className="flex gap-2 mb-3">
                    <
// @ts-ignore
                    Input
                      value={newLink.title}
                      onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                      placeholder="Link title"
                      className="flex-1 h-12 rounded-[10px]"
                    />
                    <
// @ts-ignore
                    Input
                      value={newLink.url}
                      onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                      placeholder="URL"
                      className="flex-1 h-12 rounded-[10px]"
                    />
                    <Select value={newLink.type} onValueChange={(value) => setNewLink({...newLink, type: value})}>
                      <SelectTrigger className="w-32 h-12 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <
// @ts-ignore
                      SelectContent>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="repository">Repository</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="documentation">Documentation</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="design">Design</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <
// @ts-ignore
                    Button type="button" className={'h-12 w-12'} onClick={handleAddLink} variant="outline">
                      <Plus />
                    </Button>
                  </div>
                  
                  {newProject.links.length > 0 && (
                    <div className="space-y-2">
                      {newProject.links.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-black rounded">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 icon text-gray-500" />
                            <span className="text-sm font-medium">{link.title}</span>
                            <span className="text-xs text-gray-500">({link.type})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(link.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4 icon" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <div className="flex gap-2 mb-3">
                    <
// @ts-ignore
                    Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-1 h-12 rounded-[10px]"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <
// @ts-ignore
                    Button type="button" onClick={handleAddTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  
                  {newProject.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newProject.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-[10px] text-sm"
                        >
                          <Tag className="w-3 h-3 icon" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                          >
                            <X className="w-3 h-3 icon" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Public Toggle */}
               
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t icon border-gray-200 dark:border-gray-700">
                  <
// @ts-ignore
                  Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewProjectPopup(false)}
                    className="flex-1 h-12 rounded-[10px]"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <
// @ts-ignore
                  Button
                    type="submit"
                    className="flex-1 disabled:opacity-50 h-12 disabled:cursor-not-allowed rounded-[10px]"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loader w-5 h-5 icon"></span>
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
            className="fixed inset-0 bg-black/50 icon  backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-100"
            onClick={() => {
              setShowProjectDetails(false)
              setShowTasks(false)
              setShowMeetings(false)
              setShowLinks(false)
              // Clear project member search state
              setProjectMemberSearch('')
              setShowProjectMemberSuggestions(false)
              setProjectMemberSuggestions([])
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl  text-gray-900 dark:text-white">
                      {selectedProject.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Created by {selectedProject.createdBy?.username} • {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProjectDetails(false)
                      setShowTasks(false)
                      setShowMeetings(false)
                      setShowLinks(false)
                      // Clear project member search state
                      setProjectMemberSearch('')
                      setShowProjectMemberSuggestions(false)
                      setProjectMemberSuggestions([])
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6 icon" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Project Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg  text-gray-900 dark:text-white mb-2">Description</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm text-justify line-clamp-1">
                        {selectedProject.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-4 py-2 uppercase  rounded-[10px] text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                          {getStatusIcon(selectedProject.status)}
                          {selectedProject.status}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 px-4 py-2 uppercase  rounded-[10px] text-xs font-medium ${getPriorityColor(selectedProject.priority)}`}>
                          {getPriorityIcon(selectedProject.priority)}
                          {selectedProject.priority}
                        </span>
                      </div>
                    </div>

                  

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Progress</h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-[10px] h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-[10px] transition-all duration-300"
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
                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 rounded-[10px] text-xs"
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
                      <h3 className="text-lg  text-gray-900 dark:text-white mb-2">Members ({selectedProject.members?.length || 0})</h3>
                      {/* {console.log('Rendering members:', selectedProject.members)} */}
                      <div className="space-y-2 max-h-45overflow-y-auto" key={refreshKey}>
                        {selectedProject.members && selectedProject.members.length > 0 ? selectedProject.members.map((member, index) => (
                          <div key={`${member.user?._id || member.user?.id}-${index}-${refreshKey}`} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-black rounded-[10px]">
                            <div className="flex items-center gap-2">
                              <img
                                {...getAvatarProps(member.user?.avatar, member.user?.username)}
                                alt={member.user?.username}
                                className="w-8 h-8 rounded-[10px] cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => handleUserAvatarClick(member.user?._id)}
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
                        )) : (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            No members yet
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => setShowLinks(!showLinks)}
                        className="flex items-center justify-between w-full cursor-pointer  text-left mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border rounded-[10px] transition-colors"
                      >
                        <h3 className="text-lg  text-gray-900 dark:text-white flex items-center gap-2">
                          <Link className="w-5 h-5 icon" />
                          Links ({selectedProject.links?.length || 0})
                        </h3>
                        <ChevronDown 
                          className={`w-5 h-5 icon text-gray-500 transition-transform duration-200 ${
                            showLinks ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      
                      {showLinks && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 max-h-40 overflow-y-auto px-6 py-2">
                            {selectedProject.links?.length > 0 ? (
                              selectedProject.links.map((link, index) => (
                                <motion.div 
                                  key={index} 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-black rounded-[10px]"
                                >
                                  <div className="flex items-center gap-2">
                                    <Link className="w-4 h-4 icon text-gray-500" />
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
                                    className="text-gray-500 hover:text-gray-600 text-sm w-[50px] h-[50px] border flex items-center justify-center rounded-[10px]"
                                  >
                                    <ArrowUpRightSquare className="w-4 h-4 icon" />
                                  </a>
                                </motion.div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Link className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No links added to this project</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tasks and Meetings Section */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-1 gap-6">
                  {/* Tasks */}
                  <div>
                    <button
                      onClick={() => setShowTasks(!showTasks)}
                      className="flex items-center justify-between w-full text-left hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800 p-4 border rounded-[10px] transition-colors"
                    >
                      <h3 className="text-lg  text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 icon" />
                        Tasks ({selectedProject.tasks?.length || 0})
                      </h3>
                      <ChevronDown 
                        className={`w-5 h-5 icon text-gray-500 transition-transform duration-200 ${
                          showTasks ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {showTasks && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 max-h-20 overflow-y-auto px-6 py-2">
                          {selectedProject.tasks?.length > 0 ? (
                            selectedProject.tasks.map((task, index) => (
                              <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-[10px] ${
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
                                <span className={`px-2 py-1 rounded-[10px] text-xs font-medium ${
                                  task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  task.status === 'in_progress' ? 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200' :
                                  task.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {task.status ? task.status.replace('_', ' ') : 'Unknown'}
                                </span>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <p>No tasks assigned to this project</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Meetings */}
                  <div>
                    <button
                      onClick={() => setShowMeetings(!showMeetings)}
                      className="flex items-center justify-between w-full text-left cursor-pointer mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border rounded-[10px] transition-colors"
                    >
                      <h3 className="text-lg  text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 icon icon" />
                        Meetings ({selectedProject.meetings?.length || 0})
                      </h3>
                      <ChevronDown 
                        className={`w-5 h-5 icon text-gray-500 transition-transform duration-200 ${
                          showMeetings ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {showMeetings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 max-h-20 overflow-y-auto px-6 py-2">
                          {selectedProject.meetings?.length > 0 ? (
                            selectedProject.meetings.map((meeting, index) => (
                              <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-[10px] ${
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
                                <span className={`px-2 py-1 rounded-[10px] text-xs font-medium ${
                                  meeting.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  meeting.status === 'scheduled' ? 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200' :
                                  meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {meeting.status || 'Unknown'}
                                </span>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <p>No meetings scheduled for this project</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {isProjectOwner(selectedProject) && (
                  <div className="flex gap-3 mt-6 pt-4  icon border-gray-200 dark:border-gray-700">
                    <
// @ts-ignore
                    Button
                      onClick={() => {
                        setProjectProgress(selectedProject.progress || 0)
                        setShowProgressModal(true)
                      }}
                      className="flex-1 h-12 rounded-[10px]"
                    >
                      <TrendingUp className="w-4 h-4 icon mr-2" />
                      Update Progress
                    </Button>
                    <
// @ts-ignore
                    Button
                      variant="outline"
                      onClick={() => {
                        setShowMembersModal(true)
                      }}
                      className="flex-1 h-12 rounded-[10px]"
                    >
                      <PiUsersDuotone className="w-4 h-4 icon mr-2" />
                      Edit Members
                    </Button>
                    <
// @ts-ignore
                    Button
                      variant="outline"
                      onClick={() => {
                        setShowLinksModal(true)
                      }}
                      className="flex-1 h-12 rounded-[10px]"
                    >
                      <Link className="w-4 h-4 icon mr-2" />
                      Manage Links
                    </Button>
                    <
// @ts-ignore
                    Button
                      variant="outline"
                      onClick={() => handleViewProject(selectedProject)}
                      className="flex-1 h-12 rounded-[10px]"
                    >
                      <RefreshCw className="w-4 h-4 icon mr-2" />
                      Refresh
                    </Button>
                  </div>
                )}
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
              className="bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl  text-gray-900 dark:text-white">
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
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-[10px] appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex gap-3">
                  <
// @ts-ignore
                  Button
                    variant="outline"
                    onClick={() => setShowProgressModal(false)}
                    className="flex-1 h-12 rounded-[10px]"
                  >
                    Cancel
                  </Button>
                  <
// @ts-ignore
                  Button
                    onClick={handleUpdateProgress}
                    className="flex-1 h-12 rounded-[10px]"
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
              className="bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl  text-gray-900 dark:text-white">
                    Manage Members - {selectedProject.name}
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
                    {/* <h3 className="text-lg  text-gray-900 dark:text-white mb-2">Add Member</h3> */}
                    <div className="flex gap-2">
                      <
// @ts-ignore
                      Input
                        value={projectMemberSearch}
                        onChange={(e) => handleProjectMemberSearch(e.target.value)}
                        placeholder="Search users..."
                        className="flex-1 h-12 rounded-[10px]"
                      />
                      <Select value={projectMemberRole} onValueChange={setProjectMemberRole}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <
// @ts-ignore
                        SelectContent>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="member">Member</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="admin">Admin</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {showProjectMemberSuggestions && projectMemberSuggestions.length > 0 && (
                      <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-[10px] bg-white dark:bg-black max-h-40 overflow-y-auto">
                        {projectMemberSuggestions.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              handleAddMemberToProject(user.id, projectMemberRole)
                              setProjectMemberSearch('')
                              setShowProjectMemberSuggestions(false)
                            }}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            <img
                              {...getAvatarProps(user.avatar, user.username)}
                              alt={user.username}
                              className="w-10 h-10 rounded-[10px]"
                            />
                           <div className="flex flex-col">
                           <span className="text-sm text-gray-900 dark:text-white ">{user.username}</span>
                           <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
                           </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Current Members */}
                  <div>
                    <h3 className="text-lg  text-gray-900 dark:text-white mb-2">Current Members</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto" key={refreshKey}>
                      {selectedProject.members?.map((member, index) => (
                        <div key={`${member.user?._id || member.user?.id}-${index}-${refreshKey}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]">
                          <div className="flex items-center gap-3">
                            <img
                              {...getAvatarProps(member.user?.avatar, member.user?.username)}
                              alt={member.user?.username}
                              className="w-8 h-8 rounded-[10px] cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => handleUserAvatarClick(member.user?.id)}
                              title={`View ${member.user?.username}'s profile`}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.user?.username}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                               {member.role == "owner" ? "Created" : "Joined"} {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        {
                          member.role !== "owner" &&   <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMemberFromProject(member.user?._id)}
                          className="text-red-500 hover:text-red-700 w-12 border"
                        >
                          <Trash2 className="w-4 h-4 icon" />
                        </Button>
                        }
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
              className="bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl  text-gray-900 dark:text-white">
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
                    <h3 className="text-lg  text-gray-900 dark:text-white mb-2">Add Link</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <
// @ts-ignore
                      Input
                        value={newLink.title}
                        onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                        placeholder="Link title"
                      />
                      <
// @ts-ignore
                      Input
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
                        <
// @ts-ignore
                        SelectContent>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="repository">Repository</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="documentation">Documentation</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="design">Design</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <
// @ts-ignore
                      Button
                        onClick={() => {
                          if (newLink.title && newLink.url) {
                            handleAddLinkToProject(newLink)
                            setNewLink({ title: '', url: '', type: 'other' })
                          }
                        }}
                        className="flex-1 h-12 rounded-[10px]"
                      >
                        Add Link
                      </Button>
                    </div>
                  </div>

                  {/* Current Links */}
                  <div>
                    <h3 className="text-lg  text-gray-900 dark:text-white mb-2">Current Links</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedProject.links?.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]">
                          <div className="flex items-center gap-3">
                            <Link className="w-4 h-4 icon text-gray-500" />
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
                              <Trash2 className="w-4 h-4 icon" />
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
