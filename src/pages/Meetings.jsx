import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Edit, Trash2, Calendar, User, Clock, CheckCircle, AlertCircle, MoreVertical, Filter, Video, MapPin, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Checkbox } from "../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import userService from "../services/userService"
import meetingService from "../services/meetingService"
import { useAuth } from "../contexts/AuthContext"
import { getAvatarProps } from "../utils/avatarUtils"

const Meetings = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewMeetingPopup, setShowNewMeetingPopup] = useState(false)
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
    meetingLink: ""
  })
  const [assignedToSuggestions, setAssignedToSuggestions] = useState([])
  const [showAssignedToSuggestions, setShowAssignedToSuggestions] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [meetings, setMeetings] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Load meetings from API
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

  // Load users from API
  const loadUsers = async () => {
    try {
      const response = await userService.getUsers({ limit: 50 })
      const apiUsers = response.users || []
      
      // Transform API data to match the expected format
      const transformedUsers = apiUsers.map(user => ({
        id: user.id,
        name: user.username,
        username: user.username,
        email: user.email,
        role: user.role || "Team Member",
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=128`
      }))
      
      setUsers(transformedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
      setUsers([])
    }
  }

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meeting.description && meeting.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (meeting.assignedTo && meeting.assignedTo.username && meeting.assignedTo.username.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  const handleAssignedToChange = async (value) => {
    setNewMeeting({...newMeeting, assignedTo: value, assignedToId: ""})
    if (value.length > 0) {
      try {
        // Use API search for real-time user search
        const response = await userService.searchUsers(value)
        const apiUsers = response.users || []
        
        // Transform API data to match the expected format
        const transformedUsers = apiUsers.map(user => ({
          id: user.id,
          name: user.username,
          username: user.username,
          email: user.email,
          role: user.role || "Team Member",
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=128`
        }))
        
        setAssignedToSuggestions(transformedUsers)
        setShowAssignedToSuggestions(true)
      } catch (error) {
        console.error('Error searching users:', error)
        // Fallback to local filtering
        const filtered = users.filter(user => 
          (user.username || user.name).toLowerCase().includes(value.toLowerCase()) ||
          user.email.toLowerCase().includes(value.toLowerCase())
        )
        setAssignedToSuggestions(filtered)
        setShowAssignedToSuggestions(true)
      }
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
      case "online": return "text-white bg-blue-500 border border-blue-500 px-4 py-2 min-w-[80px]"
      case "physical": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[80px]"
      default: return "text-white bg-yellow-500 border border-yellow-500 px-4 py-2 min-w-[80px]"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-white bg-green-500 border border-green-500 px-4 py-2 min-w-[100px]"
      case "pregress": return "text-white bg-blue-500 border border-blue-500 px-4 py-2 min-w-[100px]"
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
        meetingLink: newMeeting.meetingLink
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
        meetingLink: ""
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

  return (
    <div className="min-h-screen p-6">
      <motion.div
        className="max-w-7xl mx-auto"
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
                className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <Plus className="w-5 h-5" />
                New Meeting
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
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
                  <SelectItem value="physical">physical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Meetings Table */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
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
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading meetings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
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
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {meeting.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {meeting.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full text-xs font-bold ${getTypeColor(meeting.type)}`}>
                        {meeting.type === 'online' && <Video className="w-3 h-3 mr-1" />}
                        {meeting.type === 'physical' && <MapPin className="w-3 h-3 mr-1" />}
                        {meeting.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full text-xs font-bold ${getStatusColor(meeting.status)}`}>
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
                          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {meeting.assignedTo?.username || "Unknown User"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Team Member
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {meeting.startDate ? new Date(meeting.startDate).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {meeting.startDate ? new Date(meeting.startDate).toLocaleTimeString() : 'N/A'} - {meeting.endDate ? new Date(meeting.endDate).toLocaleTimeString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {meeting.location}
                      </div>
                      {meeting.meetingLink && (
                        <a 
                          href={meeting.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Join Meeting
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-gray-400 hover:text-black dark:hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                            <DropdownMenuItem className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                              <Calendar className="w-4 h-4 mr-2" />
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                              <Video className="w-4 h-4 mr-2" />
                              Join Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Meeting
                            </DropdownMenuItem>
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
                Create New Meeting
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Title
                  </label>
                  <Input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder="Enter meeting title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
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
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Meeting Type
                    </label>
                    <Select value={newMeeting.type} onValueChange={(value) => setNewMeeting({...newMeeting, type: value})}>
                      <SelectTrigger className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white">
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="physical">physical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
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
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Assign To Person
                  </label>
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
                      placeholder="Type to search users..."
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
                                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                              />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">{user.role}</div>
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
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Link (Optional)
                  </label>
                  <Input
                    type="url"
                    value={newMeeting.meetingLink}
                    onChange={(e) => setNewMeeting({...newMeeting, meetingLink: e.target.value})}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder="Enter meeting link"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowNewMeetingPopup(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNewMeeting}
                  className="flex-1 px-4 py-3 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Create Meeting
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Meetings
