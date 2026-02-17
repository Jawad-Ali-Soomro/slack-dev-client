import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import HorizontalLoader from '../components/HorizontalLoader'
import {  
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MoreVertical, 
  ChevronDown,
  Eye,
  Settings,
  ExternalLink,
  Tag,
  Clock,
  CheckCircle,
  Pause,
  X,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Minus,
  AlertTriangle,
  Camera,
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

import { getButtonClasses, getInputClasses, COLOR_THEME, ICON_SIZES } from '../utils/uiConstants'
import UserDetailsModal from '../components/UserDetailsModal'
import { PiFolderDuotone, PiUsersDuotone } from 'react-icons/pi'
import { usePermissions } from '@/hooks/usePermissions'
import { Link } from 'react-router-dom'

const Projects = () => {
  const { user } = useAuth()
  const { markAsReadByType } = useNotifications()

  const { permissions, loading: permissionsLoading } = usePermissions()
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
      setProjects(response.projects || [])
      setPagination(response.pagination || pagination)
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterPriority, searchTerm, pagination.page, pagination.limit])

  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [filterStatus, filterPriority, searchTerm])

  const loadUsers = useCallback(async () => {
    try {
      const response = await friendService.getFriends()
      const friends = response.friends || []
      
      const transformedUsers = friends
        .map(friendship => ({
          id: friendship.friend.id,
          name: friendship.friend.username,
          username: friendship.friend.username,
          email: friendship.friend.email,
          role: "Friend",
          avatar: friendship.friend.avatar
        }))
        .filter(friend => friend.id !== user?.id)
      
      setUsers(transformedUsers)
    } catch (error) {
      console.error('Failed to load friends:', error)
      toast.error('Failed to load friends')
      setUsers([])
    }
  }, [user])

  const loadTeams = useCallback(async () => {
    try {
      const response = await teamService.getTeams({ limit: 100 })
      setTeams(response.teams || [])
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const response = await projectService.getProjectStats()
      setStats(response.stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }, [])

  useEffect(() => {
    loadProjects()
    loadUsers()
    loadTeams()
    loadStats()
  }, [loadProjects, loadUsers, loadTeams, loadStats])

  useEffect(() => {
    if (user && user.id) {
      markAsReadByType('projects')
    }
  }, [user, markAsReadByType])

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

  const handleRemoveMember = (userId) => {
    setNewProject(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== userId)
    }))
  }

  const handleAddLink = () => {
    if (newLink.title && newLink.url) {
      setNewProject(prev => ({
        ...prev,
        links: [...prev.links, { ...newLink, id: Date.now().toString() }]
      }))
      setNewLink({ title: '', url: '', type: 'other' })
    }
  }

  const handleRemoveLink = (linkId) => {
    setNewProject(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== linkId)
    }))
  }

  const handleAddTag = () => {

    if (newTag.trim() && !newProject.tags.includes(newTag.trim())) {
      setNewProject(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setNewProject(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProject.name.trim()) {
      toast.error('Project name is required')
      return
    }

    try {
      setLoading(true)
      let logoUrl = null
      if (newProject.logo) {
        const formData = new FormData()
        formData.append('logo', newProject.logo)
        formData.append('folder', 'projects')

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

  const handleViewProject = async (project) => {
    try {
      const response = await projectService.getProjectById(project.id)
      setSelectedProject(response.project)
      setShowProjectDetails(true)
    } catch (error) {
      toast.error('Failed to load project details')
    }
  }

  const handleUserAvatarClick = (userId) => {
    setSelectedUserId(userId)
    setShowUserDetails(true)
  }

  const isProjectOwner = (project) => {
    return project.createdBy?.id === user?.id || project.createdBy?._id === user?.id
  }

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


  const handleAddMemberToProject = async (userId, role = 'member') => {
    if (!selectedProject) return

    try {
      setLoading(true)
      await projectService.addMember(selectedProject.id, { userId, role })
      await loadProjects()
      
      if (selectedProject) {
        const response = await projectService.getProjectById(selectedProject.id)

        const projectInList = projects.find(p => p.id === selectedProject.id)
        
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

  const handleRemoveMemberFromProject = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      setLoading(true)
      
      await projectService.removeMember(selectedProject.id, { userId })
      await loadProjects()
      
      if (selectedProject) {
        const response = await projectService.getProjectById(selectedProject.id)

        const projectInList = projects.find(p => p.id === selectedProject.id)
        setSelectedProject(response.project)
        setRefreshKey(prev => prev + 1)
      }
      
      setProjectMemberSearch('')
      setShowProjectMemberSuggestions(false)
      setProjectMemberSuggestions([])
      
      toast.success('Member removed successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLinkToProject = async (linkData) => {
    if (!selectedProject) return

    try {
      await projectService.addLink(selectedProject.id, linkData)
      const response = await projectService.getProjectById(selectedProject.id)
      setSelectedProject(response.project)
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id ? response.project : project
      ))
      
      toast.success('Link added successfully!')
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error(error.message || 'Failed to add link')
    }
  }

  const handleRemoveLinkFromProject = async (linkId) => {
    if (!selectedProject) return

    try {
      await projectService.removeLink(selectedProject.id, { linkId })
      const response = await projectService.getProjectById(selectedProject.id)
      setSelectedProject(response.project)
      setProjects(prev => prev.map(project => 
        project.id === selectedProject.id ? response.project : project
      ))
      
      toast.success('Link removed successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to remove link')
    }
  }

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-black dark:text-gray-200'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low': return <ArrowDown className="w-3 h-3 icon icon" />
      case 'medium': return <Minus className="w-3 h-3 icon icon" />
      case 'high': return <ArrowUp className="w-3 h-3 icon icon" />
      case 'urgent': return <AlertTriangle className="w-3 h-3 icon icon" />
      default: return <Minus className="w-3 h-3 icon icon" />
    }
  }

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4 icon icon icon" />
      case 'active': return <CheckCircle className="w-4 h-4 icon icon icon" />
      case 'on_hold': return <Pause className="w-4 h-4 icon icon icon" />
      case 'completed': return <CheckCircle className="w-4 h-4 icon icon icon" />
      case 'cancelled': return <X className="w-4 h-4 icon icon icon" />
      default: return <Clock className="w-4 h-4 icon icon icon" />
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

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
         <div className="flex py-6 gap-3 items-center fixed z-10 md:-top-3 -top-30 z-10">
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
        <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
                  <Folder  size={15} />
                  </div>
                  <h1 className="text-2xl font-bold">My Projects</h1>
                </div>
      </div>
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="w-full md:w-auto">
            <div className="relative max-w-3xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon icon" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={getInputClasses('default', 'md', 'pl-10 w-full md:w-[500px] w-full h-13 bg-white dark:bg-[black] text-black dark:text-white')}
              />
            </div>
          </div>
          
        <div className="flex gap-4 w-full">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="md:w-[180px] w-1/2 px-5 text-gray-600 dark:text-white cursor-pointer bg-white dark:bg-[black] h-13">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <

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
            <SelectTrigger className="md:w-[180px] w-1/2 bg-white px-5 text-gray-600 dark:text-white cursor-pointer dark:bg-[black] h-13">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <

            SelectContent>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="all">All Priority</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="low">Low</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="medium">Medium</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="high">High</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </motion.div>
              </div>
          <div className="flex items-center gap-4">

            {

              permissions.canCreateProject &&       <Button
              onClick={() => {
                if (!permissions.canCreateProject) {
                  toast.error('You do not have permission to create projects. Contact an admin.');
                  return;
                }
                setShowNewProjectPopup(true);
              }}
              className={'md:w-[200px] w-full rounded-[10px] rounded-[10px] h-12 font-bold'}
            >
              <PiFolderDuotone />
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

              Button
                onClick={() => {
                  if (!permissions.canCreateProject) {
                    toast.error('You do not have permission to create projects. Contact an admin.');
                    return;
                  }
                  setShowNewProjectPopup(true);
                }}
                disabled={!permissions.canCreateProject}
                className={'md:w-[200px] w-full'}
              >
                <Plus className="w-4 h-4 icon icon mr-2 icon" />
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
                      <Eye className="w-4 h-4 icon icon icon" />
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
                      <TrendingUp className="w-4 h-4 icon icon icon" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-2 w-12">
                          <MoreVertical className="w-4 h-4 icon icon icon" />
                        </Button>
                      </DropdownMenuTrigger>
                      <

                      DropdownMenuContent align="end">
                        <

                        DropdownMenuItem className="h-10 px-5 cursor-pointer" onClick={() => handleViewProject(project)}>
                          <Eye className="w-4 h-4 icon icon mr-2 icon" />
                          View Details
                        </DropdownMenuItem>
                        {isProjectOwner(project) && (
                          <>
                            <

                            DropdownMenuItem className="h-10 px-5 cursor-pointer">
                              <Edit className="w-4 h-4 icon icon mr-2 icon" />
                              Edit Project
                            </DropdownMenuItem>
                            <

                            DropdownMenuItem className="h-10 px-5 cursor-pointer" onClick={() => {
                              setSelectedProject(project)
                              setShowMembersModal(true)
                            }}>
                              <Settings className="w-4 h-4 icon icon mr-2 icon" />
                              Edit Members
                            </DropdownMenuItem>
                           
                            <

                            DropdownMenuItem className="h-10 px-5 cursor-pointer text-red-600" 
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="w-4 h-4 icon icon mr-2" />
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
                  <span className={`inline-flex items-center border gap-1 uppercase px-4 py-2 rounded-[10px] text-[10px] font-medium w-auto  ${getStatusColor(project.status)}`}>
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
                      <Users className="w-4 h-4 icon icon icon" />
                      <span>Team: {project.teamId.name}</span>
                    </div>
                  </div>
                )} */}

                {/* Project Stats */}
                {/* <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 col-span-2 dark:text-gray-400">
                    
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 icon icon icon" />
                    <span>{project?.tasks.length || 0} tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 icon icon icon" />
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
                <ArrowUp className="w-4 h-4 icon icon rotate-[-90deg]" />
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
                        className={`h-12 w-12 p-0 ${
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
                <ArrowDown className="w-4 h-4 icon icon rotate-[-90deg]" />
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
              className="bg-white dark:bg-gray-900 rounded-[20px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
            

              <form onSubmit={handleCreateProject} className="space-y-2">
                {/* Project Name and Description */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <

                    Input
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="Project name *"
                      className="w-full h-12 rounded-[10px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <Textarea

                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Project description *"
                      className="w-full h-12 rounded-[10px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                      rows="3"
                      required
                    />
                  </div>
                  <div>
                    <Select value={newProject.teamId || "none"} onValueChange={(value) => setNewProject({...newProject, teamId: value === "none" ? "" : value})}>
                      <SelectTrigger className="w-full h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white">
                        <SelectValue placeholder="Select Team (Optional)" />
                      </SelectTrigger>
                      <

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
                          className="w-16 h-16 rounded-[10px] object-cover  border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900"
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
                      null
                    )}
                    <div className="w-full flex justify-center items-center">
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
                        className="cursor-pointer border inline-flex items-center justify-center px-10 py-5 w-full border border-gray-300 dark:border-gray-600 rounded-[30px] shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Camera className="w-4 h-4 icon icon mr-2 icon" />
                        {newProject.logo ? 'Change Logo' : 'Upload Logo'}
                      </label>
                    
                    </div>
                  </div>
                </div>

                {/* Status, Priority, and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select value={newProject.status} onValueChange={(value) => setNewProject({...newProject, status: value})}>
                      <SelectTrigger className="w-full h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <

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
                      <SelectTrigger className="w-full h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <

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
                      className="w-full h-12 rounded-[10px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                      placeholder="End date"
                      className="w-full h-12 rounded-[10px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                    />
                  </div>
                </div>

                {/* Members */}
                <div>
                  <div className="relative mb-3">
                    <

                    Input
                      value={memberSearch}
                      onChange={(e) => handleMemberSearch(e.target.value)}
                      placeholder="Add team members"
                      className="w-full h-12 rounded-[10px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
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
                            className="w-4 h-4 icon icon rounded-[10px]"
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

                    Input
                      value={newLink.title}
                      onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                      placeholder="Link title"
                      className="flex-1 h-12 rounded-[10px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                    />
                    <

                    Input
                      value={newLink.url}
                      onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                      placeholder="URL"
                      className="flex-1 h-12 rounded-[10px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                    />
                    <Select value={newLink.type} onValueChange={(value) => setNewLink({...newLink, type: value})}>
                      <SelectTrigger className="w-32 h-12 cursor-pointer border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <

                      SelectContent>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="repository">Repository</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="documentation">Documentation</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="design">Design</SelectItem>
                        <SelectItem className={'px-5 h-10 cursor-pointer'} value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <

                    Button type="button" className={'h-12 w-12'} onClick={handleAddLink} variant="outline">
                      <Plus />
                    </Button>
                  </div>
                  
                  {newProject.links.length > 0 && (
                    <div className="space-y-2">
                      {newProject.links.map((link) => (
                        <div key={link.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-black rounded">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 icon icon text-gray-500" />
                            <span className="text-sm font-medium">{link.title}</span>
                            <span className="text-xs text-gray-500">({link.type})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(link.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4 icon icon" />
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

                    Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-1 h-12 rounded-[10px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <

                    Button type="button" onClick={handleAddTag} variant="outline" className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white">
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

                  Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewProjectPopup(false)}
                    className="flex-1 h-12 rounded-[10px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <

                  Button
                    type="submit"
                    className="flex-1 disabled:opacity-50 h-12 disabled:cursor-not-allowed rounded-[10px] border-gray-200 dark:border-gray-700 bg-black dark:bg-white text-white dark:text-black "
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
            className="fixed inset-0 bg-black/50 icon  backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-100"
            onClick={() => {
              setShowProjectDetails(false)
              setShowTasks(false)
              setShowMeetings(false)
              setShowLinks(false)

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
                    <h2 className="text-2xl  text-gray-900 dark:text-white font-bold">
                      {selectedProject.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                      Created by {selectedProject.createdBy?.username} • {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProjectDetails(false)
                      setShowTasks(false)
                      setShowMeetings(false)
                      setShowLinks(false)

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
                      <h3 className="text-sm  text-gray-900 dark:text-white mb-2 font-bold">Project Description</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm text-justify line-clamp-1">
                        {selectedProject.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-4 w-full py-2 uppercase  rounded-[10px] text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
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
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Project Progress</h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-[10px] h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-[10px] transition-all duration-300"
                          style={{ width: `${selectedProject.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-bold text-end">
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
                        onClick={() => setShowLinks(!showLinks) || setShowTasks(false) || setShowMeetings(false)}
                        className="flex items-center justify-between w-full cursor-pointer  text-left mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border rounded-[10px] transition-colors"
                      >
                        <h3 className="text-sm  text-gray-900 dark:text-white flex items-center gap-2 font-bold">
                          <Link className="w-5 h-5 icon" />
                          Project Links ({selectedProject.links?.length || 0})
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
                                    <Link className="w-4 h-4 icon icon text-gray-500" />
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
                                    <ArrowUpRightSquare className="w-4 h-4 icon icon" />
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
                <div className="mt-0 grid grid-cols-1 lg:grid-cols-1 gap-6">
                  {/* Tasks */}
                  <div>
                    <button
                      onClick={() => setShowTasks(!showTasks) || setShowMeetings(false) || setShowLinks(false)}
                      className="flex items-center justify-between w-full   text-left hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800 p-4 border rounded-[10px] transition-colors"
                    >
                      <h3 className="text-sm  text-gray-900 dark:text-white flex items-center gap-2 font-bold">
                        <CheckCircle className="w-5 h-5 icon" />
                        Project Tasks ({selectedProject.tasks?.length || 0})
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
                        <div className="space-y-2 max-h-50 overflow-y-auto px-6 py-2">
                          {selectedProject.tasks?.length > 0 ? (
                            selectedProject.tasks.map((task, index) => (
                              <motion.div 
                                key={index} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-black rounded-[10px]"
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
                      onClick={() => {setShowMeetings(!showMeetings); setShowTasks(false); setShowLinks(false);}}
                      className="flex items-center justify-between w-full text-left cursor-pointer mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border rounded-[10px] transition-colors"
                    >
                      <h3 className="text-sm  text-gray-900 dark:text-white flex items-center gap-2 font-bold">
                        <Calendar className="w-5 h-5 icon icon" />
                        Project Meetings ({selectedProject.meetings?.length || 0})
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
                        <div className="space-y-2 max-h-50 overflow-y-auto px-6 py-2">
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
            className="fixed inset-0 backdrop-blur-sm icon bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50"
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
                <h2 className="text-xl  text-gray-900 dark:text-white font-bold">
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

                  Button
                    variant="outline"
                    onClick={() => setShowProgressModal(false)}
                    className="flex-1 h-12 rounded-[10px]"
                  >
                    Cancel
                  </Button>
                  <

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
            className="fixed inset-0 backdrop-blur-sm icon bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50"
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
                  <h2 className="text-xl  text-gray-900 dark:text-white font-bold">
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
                          <Trash2 className="w-4 h-4 icon icon" />
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
            className="fixed inset-0 backdrop-blur-sm icon bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50"
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
                  <h2 className="text-xl  text-gray-900 dark:text-white font-bold">
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

                      Input
                        value={newLink.title}
                        onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                        placeholder="Link title"
                      />
                      <

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

                        SelectContent>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="repository">Repository</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="documentation">Documentation</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="design">Design</SelectItem>
                          <SelectItem className={'px-5 h-10 cursor-pointer'} value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <

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
                            <Link className="w-4 h-4 icon icon text-gray-500" />
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
                              <Trash2 className="w-4 h-4 icon icon" />
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
