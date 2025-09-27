import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Edit, Trash2, Calendar, User, Clock, CheckCircle, AlertCircle, MoreVertical, Filter, Video, MapPin, ChevronDown, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Checkbox } from "../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { userService } from "../services/userService"
import meetingService from "../services/meetingService"
import projectService from "../services/projectService"
import teamService from "../services/teamService"
import friendService from "../services/friendService"
import { useAuth } from "../contexts/AuthContext"
import { getAvatarProps } from "../utils/avatarUtils"
import MeetingEditModal from "../components/MeetingEditModal"
import UserDetailsModal from "../components/UserDetailsModal"
import { getButtonClasses, getInputClasses, COLOR_THEME, ICON_SIZES } from "../utils/uiConstants"

const Meetings = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewMeetingPopup, setShowNewMeetingPopup] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedMeetings, setSelectedMeetings] = useState([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    type: "online",
    assignedTo: "",
    assignedToId: "",
    startDate: "",
    endDate: "",
    location: "",
    meetingLink: "",
    attendees: [],
    tags: [],
    projectId: "none"
  })
  const [assignedToSuggestions, setAssignedToSuggestions] = useState([])
  const [showAssignedToSuggestions, setShowAssignedToSuggestions] = useState(false)
  const [attendeeSuggestions, setAttendeeSuggestions] = useState([])
  const [showAttendeeSuggestions, setShowAttendeeSuggestions] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [meetings, setMeetings] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Load meetings from API
  // Handle user avatar click
  const handleUserAvatarClick = (userId) => {
    console.log('Meetings avatar clicked for user ID:', userId)
    setSelectedUserId(userId)
    setShowUserDetails(true)
    console.log('Modal should open now')
  }

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true)
      const filters = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        type: filterType !== "all" ? filterType : undefined,
        page: pagination.page,
        limit: pagination.limit
      }
      
      const response = await meetingService.getMeetings(filters)
      const allMeetings = response.meetings || []
      
      // Filter meetings based on authorization - show only meetings assigned to or assigned by current user
      const authorizedMeetings = allMeetings.filter(meeting => {
        if (!user || !user.id) return false
        
        // Show meetings where current user is assigned to or assigned by
        return meeting.assignedTo?.id === user.id || meeting.assignedBy?.id === user.id
      })
      
      setMeetings(authorizedMeetings)
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error('Error loading meetings:', error)
      toast.error(error.message || 'Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterType, pagination.page, pagination.limit, user])

  // Load meetings on component mount and when filters change
  useEffect(() => {
    console.log('Meetings useEffect triggered:', { user: user?.id, filterStatus, filterType })
    if (user && user.id) {
      loadMeetings()
    }
  }, [filterStatus, filterType, user])

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
      setAvailableUsers(users)
      return
    }
    try {
      const response = await teamService.getTeamMembers(teamId)
      setAvailableUsers(response.members || [])
    } catch (error) {
      console.error('Error loading team members:', error)
      setAvailableUsers(users)
    }
  }

  // Update available users based on project selection
  const updateAvailableUsers = useCallback(() => {
    if (newMeeting.projectId && newMeeting.projectId !== "none") {
      // Find the selected project
      const selectedProject = projects.find(p => p.id === newMeeting.projectId)
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
  }, [newMeeting.projectId, projects, users])

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

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meeting.description && meeting.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (meeting.assignedTo && meeting.assignedTo.username && meeting.assignedTo.username.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  const handleAssignedToChange = async (value) => {
    setNewMeeting({...newMeeting, assignedTo: value, assignedToId: ""})
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
    setNewMeeting({
      ...newMeeting, 
      assignedTo: user.username || user.name,
      assignedToId: user.id
    })
    setShowAssignedToSuggestions(false)
  }

  const handleSelectAll = () => {
    if (selectedMeetings.length === filteredMeetings.length) {
      setSelectedMeetings([])
    } else {
      setSelectedMeetings(filteredMeetings.map(meeting => meeting.id))
    }
  }

  const handleSelectMeeting = (meetingId) => {
    if (selectedMeetings.includes(meetingId)) {
      setSelectedMeetings(selectedMeetings.filter(id => id !== meetingId))
    } else {
      setSelectedMeetings([...selectedMeetings, meetingId])
    }
  }

  const handleBulkDelete = () => {
    if (selectedMeetings.length === 0) {
      toast.error("No meetings selected")
      return
    }
    
    setMeetings(meetings.filter(meeting => !selectedMeetings.includes(meeting.id)))
    setSelectedMeetings([])
    toast.success(`${selectedMeetings.length} meeting(s) deleted successfully!`)
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "online": return "text-white bg-gray-500 border border-gray-500 px-4 py-2 min-w-[80px]"
      case "in-person": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[80px]"
      case "hybrid": return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[80px]"
      default: return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[80px]"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[100px]"
      case "pregress": return "text-white bg-gray-500 border border-gray-500 px-4 py-2 min-w-[100px]"
      case "scheduled": return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[100px]"
      case "cancelled": return "text-white bg-red-500 border border-red-500 px-4 py-2 min-w-[100px]"
      default: return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[100px]"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />
      case "pregress": return <Clock className="w-4 h-4" />
      case "scheduled": return <Calendar className="w-4 h-4" />
      case "cancelled": return <AlertCircle className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const handleNewMeeting = async () => {
    if (!newMeeting.title.trim()) {
      toast.error("Please enter a meeting title")
      return
    }

    if (!newMeeting.assignedTo.trim() || !newMeeting.assignedToId) {
      toast.error("Please select a person to assign the meeting to")
      return
    }

    try {
      setLoading(true)
      
      const meetingData = {
        title: newMeeting.title,
        description: newMeeting.description,
        type: newMeeting.type,
        assignedTo: newMeeting.assignedToId,
        startDate: newMeeting.startDate,
        endDate: newMeeting.endDate,
        location: newMeeting.location,
        meetingLink: newMeeting.meetingLink,
        attendees: newMeeting.attendees.map(attendee => attendee.id),
        tags: newMeeting.tags,
        projectId: newMeeting.projectId && newMeeting.projectId !== "none" ? newMeeting.projectId : undefined
      }

      const response = await meetingService.createMeeting(meetingData)
      
      // Reload meetings to get the updated list
      await loadMeetings()
      
      setNewMeeting({ 
        title: "", 
        description: "", 
        type: "online", 
        assignedTo: "", 
        assignedToId: "",
        startDate: "", 
        endDate: "",
        location: "",
        meetingLink: "",
        attendees: [],
        tags: [],
        projectId: "none"
      })
      setShowNewMeetingPopup(false)
      toast.success("Meeting created successfully!")
    } catch (error) {
      console.error('Error creating meeting:', error)
      toast.error(error.message || 'Failed to create meeting')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMeeting = async (id) => {
    try {
      setLoading(true)
      await meetingService.deleteMeeting(id)
      await loadMeetings() // Reload meetings after deletion
      toast.success("Meeting deleted successfully!")
    } catch (error) {
      console.error('Error deleting meeting:', error)
      toast.error(error.message || 'Failed to delete meeting')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (meetingId, newStatus) => {
    try {
      setLoading(true)
      await meetingService.updateMeetingStatus(meetingId, newStatus)
      await loadMeetings() // Reload meetings after status change
      toast.success("Meeting status updated successfully!")
    } catch (error) {
      console.error('Error updating meeting status:', error)
      toast.error(error.message || 'Failed to update meeting status')
    } finally {
      setLoading(false)
    }
  }

  // Handle attendee selection
  const handleAttendeeSearch = (value) => {
    if (value.length > 0) {
      const filtered = availableUsers.filter(user => 
        user.username.toLowerCase().includes(value.toLowerCase()) &&
        !newMeeting.attendees.some(attendee => attendee.id === user.id)
      )
      setAttendeeSuggestions(filtered)
      setShowAttendeeSuggestions(true)
    } else {
      setAttendeeSuggestions([])
      setShowAttendeeSuggestions(false)
    }
  }

  const handleAddAttendee = (user) => {
    if (!newMeeting.attendees.some(attendee => attendee.id === user.id)) {
      setNewMeeting({
        ...newMeeting,
        attendees: [...newMeeting.attendees, user]
      })
    }
    setShowAttendeeSuggestions(false)
    setAttendeeSuggestions([])
  }

  const handleRemoveAttendee = (userId) => {
    setNewMeeting({
      ...newMeeting,
      attendees: newMeeting.attendees.filter(attendee => attendee.id !== userId)
    })
  }

  // Handle tag management
  const handleAddTag = () => {
    if (newTag.trim() && !newMeeting.tags.includes(newTag.trim())) {
      setNewMeeting({
        ...newMeeting,
        tags: [...newMeeting.tags, newTag.trim()]
      })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setNewMeeting({
      ...newMeeting,
      tags: newMeeting.tags.filter(tag => tag !== tagToRemove)
    })
  }

  // Edit meeting functions
  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting)
    setShowEditModal(true)
  }

  const handleMeetingUpdated = (updatedMeeting) => {
    setMeetings(prevMeetings => 
      prevMeetings.map(meeting => 
        meeting.id === updatedMeeting.id ? updatedMeeting : meeting
      )
    )
    setShowEditModal(false)
    setEditingMeeting(null)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingMeeting(null)
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

  const handleJoinMeeting = (meetingLink) => {
    window.open(meetingLink, '_blank')
  }

  return (
    <div className="overflow-hidden pt-6 pl-6">
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
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                Meetings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Schedule and manage your team meetings
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedMeetings.length > 0 && (
                <motion.button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedMeetings.length})
                </motion.button>
              )}
              <Button
                onClick={() => setShowNewMeetingPopup(true)}
                className={getButtonClasses('primary', 'md', 'flex items-center gap-2')}
              >
                <Plus className={ICON_SIZES.sm} />
                New Meeting
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-50" />
              <Input
                type="text"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-900 text-black dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-900 text-black dark:text-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="pregress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px] border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-900 text-black dark:text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in-person">in-person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Meetings Table */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <tr>
                      <th className="px-6 py-4 text-left">
                        <Checkbox
                          checked={selectedMeetings.length === filteredMeetings.length && filteredMeetings.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-2 border-gray-300 dark:border-gray-600"
                        />
                      </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Meeting
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading meetings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No meetings found
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((meeting) => (
                  <motion.tr
                    key={meeting.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedMeetings.includes(meeting.id) ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                        <td className="px-6 py-4">
                          <Checkbox
                            checked={selectedMeetings.includes(meeting.id)}
                            onCheckedChange={() => handleSelectMeeting(meeting.id)}
                            className="border-2 border-gray-300 dark:border-gray-600"
                          />
                        </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {meeting.title}
                        </div>
                        {/* <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {meeting.description}
                        </div> */}
                        {/* {meeting.tags && meeting.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {meeting.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )} */}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full text-xs font-bold truncate ${getTypeColor(meeting.type)}`}>
                        {meeting.type === 'online' && <Video className="w-3 h-3 mr-1" />}
                        {meeting.type === 'in-person' && <MapPin className="w-3 h-3 mr-1" />}
                        {meeting.type === 'hybrid' && <Calendar className="w-3 h-3 mr-1" />}
                        {meeting.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full text-xs font-bold truncate ${getStatusColor(meeting.status)}`}>
                        {getStatusIcon(meeting.status)}
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 w-[200px]">
                      <div className="flex items-center gap-3">
                        <img 
                          {...getAvatarProps(
                            meeting.assignedTo?.avatar, 
                            meeting.assignedTo?.username
                          )}
                          alt={meeting.assignedTo?.username || "User"}
                          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => meeting.assignedTo?.id && handleUserAvatarClick(meeting.assignedTo.id)}
                          title={meeting.assignedTo?.username ? `View ${meeting.assignedTo.username}'s profile` : ''}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {meeting.assignedTo?.username || "Unknown User"}
                          </div>
                        
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {meeting.attendees && meeting.attendees.length > 0 ? (
                          meeting.attendees.slice(0, 3).map((attendee, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <img 
                                {...getAvatarProps(attendee.avatar, attendee.username)}
                                alt={attendee.username || "User"}
                                className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => attendee.id && handleUserAvatarClick(attendee.id)}
                                title={attendee.username ? `View ${attendee.username}'s profile` : ''}
                              />
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">No attendees</span>
                        )}
                        {meeting.attendees && meeting.attendees.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              +{meeting.attendees.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 w-[200px]">
                      {meeting.project ? (
                        <div className="flex items-center gap-2">
                          {/* {meeting.project.logo && (
                            <img 
                            {...getAvatarProps(meeting.project.logo, meeting.project.name)}
                            alt={meeting.project.name || "User"}
                            className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => attendee.id && handleUserAvatarClick(attendee.id)}
                            title={meeting.attendees.username ? `View ${meeting.attendees.username}'s profile` : ''}
                          />
                          )} */}
                          <span className="text-sm text-gray-900 dark:text-white truncate">
                            {meeting.project.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No Project</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {meeting.startDate ? new Date(meeting.startDate).toLocaleDateString() : 'N/A'}
                          </div>
                          {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                            {meeting.startDate ? new Date(meeting.startDate).toLocaleTimeString() : 'N/A'} - {meeting.endDate ? new Date(meeting.endDate).toLocaleTimeString() : 'N/A'}
                          </div> */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white truncate">
                        {meeting.location}
                      </div>
                      {/* {meeting.meetingLink && (
                        <a 
                          href={meeting.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Join Meeting
                        </a>
                      )} */}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user && user.id && meeting.assignedBy?.id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMeeting(meeting)}
                            className="p-2 text-gray-400 hover:text-black dark:hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {user && user.id && meeting.assignedBy?.id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 text-gray-400 hover:text-black dark:hover:text-white"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
                            {user && user.id && meeting.assignedBy?.id === user.id && (
                              <DropdownMenuItem 
                                onClick={() => handleEditMeeting(meeting)}
                                className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Meeting
                              </DropdownMenuItem>
                            )}
                            {user && user.id && meeting.assignedBy?.id === user.id && (
                              <DropdownMenuItem 
                                onClick={() => handleEditMeeting(meeting)}
                                className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleJoinMeeting(meeting.meetingLink)}>
                              <Video className="w-4 h-4 mr-2" />
                              Join Meeting
                            </DropdownMenuItem>
                            {user && user.id && meeting.assignedBy?.id === user.id && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMeeting(meeting.id)}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Meeting
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

        {/* New Meeting Popup */}
        {showNewMeetingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewMeetingPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
                New Meeting
              </h2>
              
              <div className="space-y-4">
                <div>
                  {/* <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Title
                  </label> */}
                  <Input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder="Enter meeting title"
                  />
                </div>

                <div>
                  {/* <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label> */}
                  <Textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder="Enter meeting description"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {/* <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Meeting Type
                    </label> */}
                    <Select value={newMeeting.type} onValueChange={(value) => setNewMeeting({...newMeeting, type: value})}>
                      <SelectTrigger className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white">
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="in-person">in-person</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    {/* <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label> */}
                    <Input
                      type="text"
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="Enter location or platform"
                    />
                  </div>
                </div>

                <div>
                  {/* <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Assign To Person
                  </label> */}
                  <div className="relative">
                    <Input
                      type="text"
                      value={newMeeting.assignedTo}
                      onChange={(e) => handleAssignedToChange(e.target.value)}
                      onFocus={() => {
                        if (newMeeting.assignedTo.length > 0) {
                          setShowAssignedToSuggestions(true)
                        }
                      }}
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="Assign To Person"
                    />
                    {showAssignedToSuggestions && assignedToSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {assignedToSuggestions.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => selectUser(user)}
                            className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                {...getAvatarProps(user.avatar, user.username || user.name)}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUserAvatarClick(user.id)
                                }}
                                title={user.username || user.name ? `View ${user.username || user.name}'s profile` : ''}
                              />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={newMeeting.startDate}
                      onChange={(e) => setNewMeeting({...newMeeting, startDate: e.target.value})}
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={newMeeting.endDate}
                      onChange={(e) => setNewMeeting({...newMeeting, endDate: e.target.value})}
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  {/* <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Link (Optional)
                  </label> */}
                  <Input
                    type="url"
                    value={newMeeting.meetingLink}
                    onChange={(e) => setNewMeeting({...newMeeting, meetingLink: e.target.value})}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder="Enter meeting link"
                  />
                </div>

                {/* Attendees Section */}
                <div>
                  {/* <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Additional Attendees
                  </label> */}
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search and add attendees..."
                      onChange={(e) => handleAttendeeSearch(e.target.value)}
                      onFocus={() => {
                        if (attendeeSuggestions.length > 0) {
                          setShowAttendeeSuggestions(true)
                        }
                      }}
                      className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                    {showAttendeeSuggestions && attendeeSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {attendeeSuggestions.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleAddAttendee(user)}
                            className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                {...getAvatarProps(user.avatar, user.username || user.name)}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUserAvatarClick(user.id)
                                }}
                                title={user.username || user.name ? `View ${user.username || user.name}'s profile` : ''}
                              />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Attendees */}
                  {newMeeting.attendees.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {newMeeting.attendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
                          >
                            <img 
                              {...getAvatarProps(attendee.avatar, attendee.username || attendee.name)}
                              alt={attendee.name}
                              className="w-6 h-6 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => attendee.id && handleUserAvatarClick(attendee.id)}
                              title={attendee.username || attendee.name ? `View ${attendee.username || attendee.name}'s profile` : ''}
                            />
                            <span className="text-sm text-gray-900 dark:text-white">{attendee.name}</span>
                            <button
                              onClick={() => handleRemoveAttendee(attendee.id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags Section */}
                <div>
                  {/* <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label> */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                      placeholder="Add a tag and press Enter"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      className={getButtonClasses('secondary', 'sm', '')}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Selected Tags */}
                  {newMeeting.tags.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {newMeeting.tags.map((tag, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg"
                          >
                            <span className="text-sm text-gray-900 dark:text-gray-100">{tag}</span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {/* Project Selection */}
                  <Select value={newMeeting.projectId} onValueChange={(value) => setNewMeeting({...newMeeting, projectId: value})}>
                    <SelectTrigger className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white">
                      <SelectValue placeholder="Select project (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                      <SelectItem value="none">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 text-white dark:text-black">
                {/* <Button
                  onClick={() => setShowNewMeetingPopup(false)}
                  className={getButtonClasses('outline', 'md', 'flex-1')}
                >
                  Cancel
                </Button> */}
                <Button
                  onClick={handleNewMeeting}
                  disabled={loading}
                  className={`${getButtonClasses('primary', 'md', 'flex-1')} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <span className="loader w-5 h-5"></span>
                  ) : (
                    'Create Meeting'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Meeting Edit Modal */}
        <MeetingEditModal
          meeting={editingMeeting}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onMeetingUpdated={handleMeetingUpdated}
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

export default Meetings
