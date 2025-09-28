import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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
  Activity
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

const TeamsManage = () => {
  const { user } = useAuth()
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showNewTeamModal, setShowNewTeamModal] = useState(false)
  const [showTeamDetails, setShowTeamDetails] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  // Load teams
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

  // Add member to team
  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!newMember.userId) {
      toast.error('Please select a user')
      return
    }

    try {
      setLoading(true)
      await teamService.addMember(selectedTeam.id, newMember)
      await loadTeams() // Reload teams to get updated data
      setNewMember({ userId: '', role: 'member' })
      toast.success('Member added successfully')
    } catch (error) {
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
      await teamService.removeMember(selectedTeam.id, { userId })
      await loadTeams() // Reload teams to get updated data
      toast.success('Member removed successfully')
    } catch (error) {
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
      await loadTeams() // Reload teams to get updated data
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

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400 icon p2" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-500 icon" />
      default: return null
    }
  }

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-yellow-500 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100'
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your teams and collaborate with members
          </p>
        </div>
        <Button
          onClick={() => setShowNewTeamModal(true)}
            className={'w-[200px] rounded-xl h-12'}
        >
          <Plus className="w-4 h-4 mr-2 icon" />
          Create Team
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 justify-start items-center">
        <div className="bg-white dark:bg-black">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[350px] h-13"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-white dark:bg-black h-13">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className={'h-10 px-5'} value="all">All Teams</SelectItem>
            <SelectItem className={'h-10 px-5'} value="active">Active</SelectItem>
            <SelectItem className={'h-10 px-5'} value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 icon" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No teams found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first team'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowNewTeamModal(true)}>
              <Plus className="w-4 h-4 mr-2 icon" />
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
              className="bg-white dark:bg-gray-900 rounded-lg border p-6  transition-shadow duration-300"
            >
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
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
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Eye className="w-4 h-4 icon" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreVertical className="w-4 h-4 icon" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedTeam(team)
                        setShowTeamDetails(true)
                      }}>
                        <Eye className="w-4 h-4 mr-2 icon" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedTeam(team)
                        setShowMembersModal(true)
                      }}>
                        <Users className="w-4 h-4 mr-2 icon" />
                        Manage Members
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Status and Members */}
              <div className="flex gap-2 mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.isActive)}`}>
                  {team.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300">
                  <Users className="w-3 h-3 icon" />
                  {team.memberCount || team.members?.length || 0} members
                </span>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Target className="w-4 h-4 icon" />
                  <span>{team.projects?.length || 0} projects</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Activity className="w-4 h-4 icon" />
                  <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Team Members Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Members</h4>
                <div className="flex -space-x-1">
                        {team.members?.slice(0, 3).map((member, index) => (
                          <div key={index} className="relative">
                            <img
                              {...getAvatarProps(member.user?.avatar, member.user?.username)}
                              alt={member.user?.username}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-900"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-white">
                              {getRoleIcon(member.role)}
                            </div>
                          </div>
                        ))}
                  {team.members?.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 border-2 border-white dark:border-gray-900">
                      +{team.members.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Footer */}
              <div className="flex items-center justify-between pt-4 border-t icon border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created by {team.createdBy?.username}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTeam(team)
                    setShowMembersModal(true)
                  }}
                  className={'w-[200px] h-12 rounded-lg'}
                >
                  <UserPlus className="w-4 h-4 mr-1 icon" />
                  Manage
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* New Team Modal */}
      {showNewTeamModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowNewTeamModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-black rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Team</h2>
                <button
                  onClick={() => setShowNewTeamModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6 icon" />
                </button>
              </div>

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
                      <span className="loader w-5 h-5"></span>
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
          className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowTeamDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-black rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTeam.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Created by {selectedTeam.createdBy?.username} • {new Date(selectedTeam.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowTeamDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6 icon" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedTeam.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTeam.isActive)}`}>
                        {selectedTeam.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Members</h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTeam.memberCount || selectedTeam.members?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Settings</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 ${selectedTeam.settings?.allowMemberInvites ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-gray-600 dark:text-gray-400">Member invites allowed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 ${selectedTeam.settings?.allowProjectCreation ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-gray-600 dark:text-gray-400">Project creation allowed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Members ({selectedTeam.members?.length || 0})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedTeam.members?.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            {...getAvatarProps(member.user?.avatar, member.user?.username)}
                            alt={member.user?.username}
                            className="w-8 h-8 rounded-full object-cover"
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
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {getRoleIcon(member.role)}
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTeamDetails(false)
                    setShowMembersModal(true)
                  }}
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-2 icon" />
                  Manage Members
                </Button>
              </div>
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
            className="bg-white dark:bg-black rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
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
              <form onSubmit={handleAddMember} className="mb-6 p-4 bg-gray-50 dark:bg-black rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Member</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Friend
                    </label>
                    <Select value={newMember.userId} onValueChange={(value) => setNewMember({...newMember, userId: value})}>
                      <SelectTrigger className={'w-full'}>
                        <SelectValue placeholder="Choose a friend" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id} className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {user.avatar ? (
                                <img
                                  {...getAvatarProps(user.avatar, user.username)}
                                  alt={user.username}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {user.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span>{user.username} ({user.email})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                      <SelectTrigger className={'w-full'}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="mt-4 w-full">
                  <UserPlus className="w-4 h-4 mr-2 icon" />
                  Add Member
                </Button>
              </form>

              {/* Current Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Members</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTeam.members?.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          {...getAvatarProps(member.user?.avatar, member.user?.username)}
                          alt={member.user?.username}
                          className="w-8 h-8 rounded-full object-cover"
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
                        <Select
                          value={member.role}
                          onValueChange={(role) => handleUpdateMemberRole(member.user.id, role)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="w-4 h-4 icon" />
                        </Button>
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
