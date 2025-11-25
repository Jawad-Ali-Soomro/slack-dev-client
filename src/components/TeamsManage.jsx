import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import HorizontalLoader from './HorizontalLoader'
import { usePermissions } from '../hooks/usePermissions'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  Crown,
  Shield,
  User,
  X,
  CheckCircle,
  Calendar,
  Target,
  Activity,
  Settings,
  ChevronDown,
  Trash,
  ArrowUp,
  ArrowDown,
  FolderOpen
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { toast } from 'sonner'
import teamService from '../services/teamService'
import friendService from '../services/friendService'
import { getAvatarProps } from '../utils/avatarUtils'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { BsTools } from 'react-icons/bs'
import { PiUserDuotone, PiUsersDuotone } from 'react-icons/pi'

const TeamsManage = () => {

  document.title = "Teams - Manage Your Teams"

  const { user } = useAuth()
  const { markAsReadByType } = useNotifications()
  const { permissions, loading: permissionsLoading } = usePermissions()
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showNewTeamModal, setShowNewTeamModal] = useState(false)
  const [showTeamDetails, setShowTeamDetails] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showProjects, setShowProjects] = useState(false)
  console.log(selectedTeam)
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    members: [],
    settings: {
      allowMemberInvites: true,
      allowProjectCreation: true
    }
  })
  const [newMember, setNewMember] = useState({
    userId: '',
    role: 'member'
  })
  const [memberSearch, setMemberSearch] = useState('')
  const [memberSuggestions, setMemberSuggestions] = useState([])
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 0
  })

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true)
      const response = await teamService.getTeams({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
      })
      
      setTeams(response.teams || [])
      setPagination(response.pagination || pagination)
      console.log('Teams loaded:', response.teams)
    } catch (error) {
      toast.error('Failed to load teams')
      console.error('Error loading teams:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchTerm, filterStatus])

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
      console.error('Error loading friends:', error)
      toast.error('Failed to load friends')
      setUsers([])
    }
  }, [])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Mark team notifications as read when user visits this page
  useEffect(() => {
    if (user && user.id) {
      markAsReadByType('teams')
    }
  }, [user, markAsReadByType])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMemberSuggestions && !event.target.closest('.member-search-container')) {
        setShowMemberSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMemberSuggestions])

  // Create new team
  const handleCreateTeam = async (e) => {
    e.preventDefault()
    if (!newTeam.name.trim()) {
      toast.error('Team name is required')
      return
    }

    try {
      setLoading(true)
      const response = await teamService.createTeam(newTeam)
      setTeams(prev => [response.team, ...prev])
      setShowNewTeamModal(false)
      setNewTeam({
        name: '',
        description: '',
        members: [],
        settings: {
          allowMemberInvites: true,
          allowProjectCreation: true
        }
      })
      toast.success('Team created successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  // Delete team
  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return

    try {
      setLoading(true)
      await teamService.deleteTeam(teamId)
      setTeams(prev => prev.filter(team => team.id !== teamId))
      toast.success('Team deleted successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to delete team')
    } finally {
      setLoading(false)
    }
  }

  // Handle member search
  const handleMemberSearch = (value) => {
    setMemberSearch(value)
    if (value.length > 0) {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(value.toLowerCase()) &&
        !selectedTeam.members?.some(member => member.user?.id === user.id)
      )
      setMemberSuggestions(filtered)
      setShowMemberSuggestions(true)
    } else {
      setMemberSuggestions([])
      setShowMemberSuggestions(false)
    }
  }

  // Add member to team
  const handleAddMember = async (userId, role) => {
    if (!userId) {
      toast.error('Please select a user')
      return
    }

    try {
      setLoading(true)
      console.log('Adding member:', userId, 'to team:', selectedTeam.id)
      
      await teamService.addMember(selectedTeam.id, { userId, role })
      
      // Reload teams to get updated data
      console.log('Reloading teams after adding member...')
      await loadTeams()
      
      // Update selected team if it's the current team
      if (selectedTeam) {
        console.log('Fetching updated team data for:', selectedTeam.id)
        const response = await teamService.getTeamById(selectedTeam.id)
        console.log('Updated team data:', response.team)
        console.log('Updated team members count:', response.team.members.length)
        setSelectedTeam(response.team)
        setRefreshKey(prev => prev + 1)
      }
      
      setMemberSearch('')
      setShowMemberSuggestions(false)
      setMemberSuggestions([])
      toast.success('Member added successfully')
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error(error.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  // Remove member from team
  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      setLoading(true)
      console.log('Removing member:', userId, 'from team:', selectedTeam.id)
      
      await teamService.removeMember(selectedTeam.id, { userId })
      
      // Reload teams to get updated data
      console.log('Reloading teams after removing member...')
      await loadTeams()
      
      // Update selected team if it's the current team
      if (selectedTeam) {
        console.log('Fetching updated team data for:', selectedTeam.id)
        const response = await teamService.getTeamById(selectedTeam.id)
        console.log('Updated team data:', response.team)
        console.log('Updated team members count:', response.team.members.length)
        console.log('Updated team members:', response.team.members)
        console.log('Previous selectedTeam members count:', selectedTeam.members.length)
        setSelectedTeam(response.team)
        
        // Force a re-render by updating the refresh key
        setRefreshKey(prev => prev + 1)
        
        // Force a re-render by updating the state
        setTimeout(() => {
          console.log('After timeout - selectedTeam members:', selectedTeam.members.length)
        }, 100)
      }
      
      // Clear member search and suggestions
      setMemberSearch('')
      setShowMemberSuggestions(false)
      setMemberSuggestions([])
      
      toast.success('Member removed successfully')
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error(error.message || 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  // Update member role
  const handleUpdateMemberRole = async (userId, role) => {
    try {
      setLoading(true)
      await teamService.updateMemberRole(selectedTeam.id, { userId, role })
      
      // Reload teams to get updated data
      await loadTeams()
      
      // Update selected team if it's the current team
      if (selectedTeam) {
        const response = await teamService.getTeamById(selectedTeam.id)
        setSelectedTeam(response.team)
        setRefreshKey(prev => prev + 1)
      }
      
      toast.success('Member role updated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to update member role')
    } finally {
      setLoading(false)
    }
  }

  // Filter teams
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' ? team.isActive : !team.isActive)
    return matchesSearch && matchesStatus
  })

  // Pagination handlers
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

  // Reset pagination when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [filterStatus, searchTerm])

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Shield className="w-4 h-4 icon text-yellow-600 icon p2" />
      case 'admin': return <Shield className="w-4 h-4 icon text-blue-500 icon" />
      default: return null
    }
  }

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-yellow-500 text-white dark:bg-yellow-600'
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  // Check if current user is team owner
  const isTeamOwner = (team) => {
    return team.createdBy?.id === user?.id || team.createdBy?._id === user?.id
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="pt-10">
      {/* Header */}
      <div className="flex py-6 gap-3 items-center fixed z-10 -top-3 z-10">
        <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[50px]">
          <div className="flex p-3 bg-white dark:bg-gray-800 rounded-full">
                  <PiUsersDuotone  size={15} />
                  </div>
                  <h1 className="text-2xl font-bold">Your Teams</h1>
                </div>
                </div>
      <div className="flex items-center justify-between mb-6">
        <div>
        <div className="flex gap-4 justify-start items-center">
        {/* <div className="bg-white dark:bg-black"> */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon icon" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[500px] h-13 bg-white dark:bg-[#111827] text-black dark:text-white border border-gray-200 dark:border-gray-700"
            />
          </div>
        {/* </div> */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-white px-5 cursor-pointer dark:bg-[#111827] text-black dark:text-white h-13">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className={'h-10 px-5 cursor-pointer'} value="all">All Teams</SelectItem>
            <SelectItem className={'h-10 px-5 cursor-pointer'} value="active">Active</SelectItem>
            <SelectItem className={'h-10 px-5 cursor-pointer'} value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
        </div>
       
       {
        permissions.canCreateTeam &&  <Button
        onClick={() => {
          if (!permissions.canCreateTeam) {
            toast.error('You do not have permission to create teams. Contact an admin.');
            return;
          }
          setShowNewTeamModal(true);
        }}
        className={'w-[200px] rounded-[10px] h-12 font-bold'}
      >
        New Team
      </Button>
       }
      </div>

      {/* Filters */}
   

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-[10px] h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          {/* <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 icon" /> */}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No teams found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first team'}
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => {
                if (!permissions.canCreateTeam) {
                  toast.error('You do not have permission to create teams. Contact an admin.');
                  return;
                }
                setShowNewTeamModal(true);
              }} 
              disabled={!permissions.canCreateTeam}
              className={'w-[200px]'}
            >
              <Plus className="w-4 h-4 icon mr-2 icon" />
              Create Team
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTeams.map((team) => (
            <motion.div
              key={team.id}
              variants={itemVariants}
              className="bg-white dark:bg-[rgba(255,255,255,.1)] rounded-[20px] border dark:border-none p-6  transition-shadow duration-300"
            >
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg  text-gray-900 dark:text-white line-clamp-1 font-bold">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {team.description || 'No description provided'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTeam(team)
                      setShowTeamDetails(true)
                    }}
                    className="p-2 text-gray-400 w-12 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Eye className="w-4 h-4 icon icon" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2 w-12">
                        <MoreVertical className="w-4 h-4 icon icon" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className={'h-10 px-5 cursor-pointer'} onClick={() => {
                        setSelectedTeam(team)
                        setShowTeamDetails(true)
                      }}>
                        <Eye className="w-4 h-4 icon mr-2 icon" />
                        View Details
                      </DropdownMenuItem>
                      {isTeamOwner(team) && (
                        <>
                      <DropdownMenuItem className={'h-10 px-5 cursor-pointer'} onClick={() => {
                        setSelectedTeam(team)
                        setShowMembersModal(true)
                      }}>
                            <Settings className="w-4 h-4 icon mr-2 icon" />
                            Edit Members
                      </DropdownMenuItem>
                      <DropdownMenuItem className={'h-10 px-5 cursor-pointer'} 
                        onClick={() => handleDeleteTeam(team.id)}
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

              {/* Status and Members */}
              <div className="flex gap-2 mb-4">
                <span className={`inline-flex items-center px-4 py-2 rounded-[10px] text-xs uppercase  ${getStatusColor(team.isActive)}`}>
                  {team.isActive ? 'Active' : 'Inactive'}
                </span>
               
              </div>

              {/* Team Stats */}
              {/* <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-1">
                
                </div>
                <div className="flex items-center justify-end gap-2 text-gray-600 dark:text-gray-400">
                  <Activity className="w-4 h-4 icon icon" />
                  <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                </div>
              </div> */}

              {/* Team Members Preview */}
              <div className="mb-4">
                {/* <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Members</h4> */}
                <div className="flex -space-x-1">
                        {team.members?.slice(0, 3).map((member, index) => (
                          <div key={index} className="relative">
                            <img
                              {...getAvatarProps(member.user?.avatar, member.user?.username)}
                              alt={member.user?.username}
                              className="w-10 h-10 rounded-[20px] object-cover  border-white dark:border-gray-900"
                            />
                         
                          </div>
                        ))}
                  {team.members?.length > 3 && (
                    <div className="w-8 h-8 rounded-[10px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400  border-white dark:border-gray-900">
                      +{team.members.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 icon" />
                    {team.projects?.length || 0} Projects
                </div>
              </div>
           
            </motion.div>
          ))}
        </motion.div>
      )}

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
                className="flex items-center gap-1 h-8 px-3 w-[120px] h-[50px]"
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
                className="flex items-center gap-1 h-8 px-3 w-[120px] h-[50px]"
              >
                Next
                <ArrowDown className="w-4 h-4 icon rotate-[-90deg]" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Loading Overlay for Pagination */}
    

      {/* New Team Modal */}
      {showNewTeamModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 icon  backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowNewTeamModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-black rounded-[20px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
             

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                 
                  <Input
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    placeholder="Enter team name"
                    required  
                  />
                </div>

                <div>
                 
                  <Textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                    placeholder="Enter team description"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Team Settings
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={newTeam.settings.allowMemberInvites}
                        onCheckedChange={(checked) => setNewTeam({
                          ...newTeam,
                          settings: {...newTeam.settings, allowMemberInvites: checked}
                        })}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Allow Member Invites
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={newTeam.settings.allowProjectCreation}
                        onCheckedChange={(checked) => setNewTeam({
                          ...newTeam,
                          settings: {...newTeam.settings, allowProjectCreation: checked}
                        })}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Allow Project Creation
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewTeamModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="loader w-5 h-5 icon"></span>
                    ) : (
                      'Create Team'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Team Details Modal */}
      {showTeamDetails && selectedTeam && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 icon  backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowTeamDetails(false)
            setShowProjects(false)
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-black rounded-[20px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl  text-gray-900 dark:text-white font-bold">
                    {selectedTeam.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Created by {selectedTeam.createdBy?.username} • {new Date(selectedTeam.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTeamDetails(false)
                    setShowProjects(false)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6 icon" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg  text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedTeam.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className={`inline-flex items-center px-4 py-2 uppercase rounded-[10px] text-xs font-medium ${getStatusColor(selectedTeam.isActive)}`}>
                        {selectedTeam.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Settings</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 icon ${selectedTeam.settings?.allowMemberInvites ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-gray-600 dark:text-gray-400">Member invites allowed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 icon ${selectedTeam.settings?.allowProjectCreation ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-gray-600 dark:text-gray-400">Project creation allowed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <h3 className="text-lg  text-gray-900 dark:text-white mb-4">Members ({selectedTeam.members?.length || 0})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto" key={refreshKey}>
                    {selectedTeam.members?.map((member, index) => (
                      <div key={`${member.user?.id || member.user?._id}-${index}-${refreshKey}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]">
                        <div className="flex items-center gap-3">
                          <img
                            {...getAvatarProps(member.user?.avatar, member.user?.username)}
                            alt={member.user?.username}
                            className="w-8 h-8 rounded-[10px] object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.user?.username}
                            </p>
                            {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.user?.email}
                            </p> */}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 w-[70px] h-7 flex items-center justify-center uppercase rounded-[10px] text-[10px] font-medium ${getRoleColor(member.role)}`}>
                            {/* {getRoleIcon(member.role)} */}
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Projects Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 ma">
                <button
                  onClick={() => setShowProjects(!showProjects)}
                  className="flex items-center justify-between w-full text-left mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border cursor-pointer rounded-[10px] transition-colors"
                >
                  <h3 className="text-lg  text-gray-900 dark:text-white">
                    Projects ({selectedTeam.projects?.length || 0})
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 icon text-gray-500 transition-transform duration-200 ${
                      showProjects ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {showProjects && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden max-h-[300px] overflow-y-auto"
                  >
                    {selectedTeam.projects?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No projects in this team yet</p>
                        <p className="text-sm">Projects will appear here when created</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
                        {selectedTeam.projects?.map((project, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-gray-50 dark:bg-black rounded-[10px] border"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                  {project.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                  {project.description || 'No description'}
                                </p>
                              </div>
                              {/* {project.logo && (
                                <img
                                  src={project.logo}
                                  alt={project.name}
                                  className="w-8 h-8 rounded-[10px] object-cover ml-2"
                                />
                              )} */}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-[10px] text-xs uppercase font-medium ${
                                  project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {project.status || 'planning'}
                                </span>
                                <span className={`px-2 py-1 rounded-[10px] text-xs uppercase font-medium ${
                                  project.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  project.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                  project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {project.priority || 'low'}
                                </span>
                              </div>
                              {project.progress !== undefined && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {project.progress}%
                                </div>
                              )}
                            </div>
                            
                            {project.startDate && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="w-3 h-3 icon inline mr-1" />
                                Started {new Date(project.startDate).toLocaleDateString()}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {isTeamOwner(selectedTeam) && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 justify-end w-full dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTeamDetails(false)
                    setShowMembersModal(true)
                  }}
                    className="w-1/3 hover:text-white  bg-black dark:bg-white text-white dark:text-black dark:text-black hover:bg-black dark:hover:bg-white border-none hover:border-none"
                >
                    <PiUsersDuotone className="w-4 h-4 icon mr-2 icon" />
                    Edit Members
                </Button>
              </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Members Management Modal */}
      {showMembersModal && selectedTeam && (
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
            className="bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl  text-gray-900 dark:text-white">
                  Manage Members - {selectedTeam.name}
                </h2>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6 icon" />
                </button>
              </div>

              {/* Add Member Form */}
              <div className="mb-6 rounded-[10px]">
                {/* <h3 className="text-lg  text-gray-900 dark:text-white mb-4">Add New Member</h3> */}
                <div className="flex gap-2">
                  <div className="relative flex-1 member-search-container">
                    <Input
                      value={memberSearch}
                      onChange={(e) => handleMemberSearch(e.target.value)}
                      placeholder="Search users..."
                      className="w-full h-12 rounded-[10px]"
                    />
                    {showMemberSuggestions && memberSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 rounded-[10px] shadow-lg max-h-48 overflow-y-auto">
                        {memberSuggestions.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleAddMember(user.id, newMember.role)}
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
                    <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                    <SelectTrigger className="w-50 px-5 cursor-pointer">
                      <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem className={'cursor-pointer px-5'} value="member">Member</SelectItem>
                      <SelectItem className={'cursor-pointer px-5'} value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              {/* Current Members */}
              <div>
                <h3 className="text-lg  text-gray-900 dark:text-white mb-4">Current Members</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto" key={refreshKey}>
                  {selectedTeam.members?.map((member, index) => (
                    <div key={`${member.user?.id || member.user?._id}-${index}-${refreshKey}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-[10px]">
                      <div className="flex items-center gap-3">
                        <img
                          {...getAvatarProps(member.user?.avatar, member.user?.username)}
                          alt={member.user?.username}
                          className="w-8 h-8 rounded-[10px] object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.user?.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {member.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        
                       {
                        member.role !== "owner" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="text-red-600 w-12 hover:text-red-700"
                          >
                            <Trash className="w-4 h-4 icon icon" />
                          </Button>
                        )
                       }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default TeamsManage
