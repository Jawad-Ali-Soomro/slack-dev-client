import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  MoreVertical, 
  Settings,
  UserPlus,
  X,
  Crown,
  Shield,
  User
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import teamService from '../services/teamService'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { getAvatarProps } from '../utils/avatarUtils'
import StatsCard from '../components/StatsCard'
import SkeletonLoader from '../components/SkeletonLoader'
import { getButtonClasses, getInputClasses, COLOR_THEME, ICON_SIZES } from '../utils/uiConstants'
import UserDetailsModal from '../components/UserDetailsModal'

const Teams = () => {
  const { user } = useAuth()
  const { markAsReadByType } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewTeamPopup, setShowNewTeamPopup] = useState(false)
  const [selectedTeams, setSelectedTeams] = useState([])
  const [filterRole, setFilterRole] = useState('all')
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    isPublic: false
  })
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true)
      const response = await teamService.getTeams({
        role: filterRole !== 'all' ? filterRole : undefined,
        search: searchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit
      })
      setTeams(response.teams || [])
      setPagination(response.pagination || pagination)
    } catch (error) {
      console.error('Failed to load teams:', error)
      toast.error('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }, [filterRole, searchTerm, pagination.page, pagination.limit])

  const loadStats = useCallback(async () => {
    try {
      const response = await teamService.getTeamStats()
      setStats(response.stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }, [])

  const handleUserAvatarClick = (userId) => {
    if (userId) {
      setSelectedUserId(userId)
      setShowUserDetails(true)
    }
  }

  useEffect(() => {
    loadTeams()
    loadStats()
  }, [loadTeams, loadStats])

  useEffect(() => {
    if (user && user.id) {
      markAsReadByType('teams')
    }
  }, [user, markAsReadByType])

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
      setShowNewTeamPopup(false)
      setNewTeam({ name: '', description: '', isPublic: false })
      toast.success('Team created successfully!')
      loadStats()
    } catch (error) {
      console.error('Error creating team:', error)
      toast.error(error.message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return

    try {
      await teamService.deleteTeam(teamId)
      setTeams(prev => prev.filter(team => team.id !== teamId))
      toast.success('Team deleted successfully!')
      loadStats()
    } catch (error) {
      console.error('Error deleting team:', error)
      toast.error(error.message || 'Failed to delete team')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'member': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 icon" />
      case 'admin': return <Shield className="w-4 h-4 icon" />
      case 'member': return <User className="w-4 h-4 icon" />
      default: return <User className="w-4 h-4 icon" />
    }
  }

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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
            <h1 className="text-3xl  text-gray-900 dark:text-white mb-2">Teams</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your teams and collaborate with members</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowNewTeamPopup(true)}
              className={'w-[200px] rounded-[10px] h-12'}
            >
              <Plus className={ICON_SIZES.sm} />
              New Team
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {loading ? (
          <SkeletonLoader type="grid" count={4} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" />
        ) : stats ? (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Teams"
              value={stats.totalTeams}
              icon={Users}
              color="gray"
            />
            <StatsCard
              title="My Teams"
              value={stats.myTeams}
              icon={Users}
              color="blue"
            />
            <StatsCard
              title="Members"
              value={stats.totalMembers}
              icon={User}
              color="green"
            />
            <StatsCard
              title="Active"
              value={stats.activeTeams}
              icon={Users}
              color="purple"
            />
          </motion.div>
        ) : null}

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-start items-center gap-4 mb-6">
          <div className="">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon icon" />
              <Input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={getInputClasses('default', 'md', 'pl-10 w-[350px] h-13')}
              />
            </div>
          </div>
          
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40 bg-white dark:bg-black h-13">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="all">All Roles</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="owner">Owner</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="admin">Admin</SelectItem>
              <SelectItem className={'px-5 h-10 cursor-pointer'} value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Teams Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <SkeletonLoader type="grid" count={6} />
          ) : filteredTeams.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl  text-gray-900 dark:text-white mb-2">No teams found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first team</p>
              <Button
                onClick={() => setShowNewTeamPopup(true)}
                className={'w-[200px]'}
              >
                <Plus className="w-4 h-4 icon mr-2 icon" />
                Create Team
              </Button>
            </div>
          ) : (
            filteredTeams.map((team) => (
              <motion.div
                key={team.id}
                variants={itemVariants}
                className="bg-white dark:bg-black rounded-[10px]  border-gray-200 dark:border-gray-700 p-6 transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Team Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg  text-gray-900 dark:text-white mb-2">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {team.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreVertical className="w-4 h-4 icon icon" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="h-10 px-5 cursor-pointer">
                        <Settings className="w-4 h-4 icon mr-2 icon" />
                        Manage Team
                      </DropdownMenuItem>
                      <DropdownMenuItem className="h-10 px-5 cursor-pointer">
                        <UserPlus className="w-4 h-4 icon mr-2 icon" />
                        Add Members
                      </DropdownMenuItem>
                      <DropdownMenuItem className="h-10 px-5 cursor-pointer text-red-600" 
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="w-4 h-4 icon mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 icon icon" />
                    <span>{team.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className={`px-2 py-1 rounded-[10px] text-xs font-medium ${getRoleColor(team.role)}`}>
                      {getRoleIcon(team.role)}
                      {team.role}
                    </span>
                  </div>
                </div>

                {/* Team Members */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex -space-x-2">
                    {team.members?.slice(0, 3).map((member, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-[10px]  border-white dark:border-gray-900 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        title={member.user?.username}
                        onClick={() => handleUserAvatarClick(member.user?._id || member.user?.id)}
                      >
                        <img
                          {...getAvatarProps(member.user?.avatar, member.user?.username)}
                          alt={member.user?.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {team.members?.length > 3 && (
                      <div className="w-8 h-8 rounded-[10px]  border-white dark:border-gray-900 bg-gray-100 dark:bg-black flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                        +{team.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* New Team Popup */}
        {showNewTeamPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewTeamPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl  text-gray-900 dark:text-white">Create New Team</h2>
                <button
                  onClick={() => setShowNewTeamPopup(false)}
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
                    placeholder="Team name *"
                    className="w-full h-12 rounded-[10px]"
                    required
                  />
                </div>
                
                <div>
                  <Textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                    placeholder="Team description"
                    className="w-full h-12 rounded-[10px]"
                    rows="3"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newTeam.isPublic}
                    onChange={(e) => setNewTeam({...newTeam, isPublic: e.target.checked})}
                    className="w-4 h-4 icon text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 dark:focus:ring-gray-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                    Make this team public
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewTeamPopup(false)}
                    className="flex-1 h-12 rounded-[10px]"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 disabled:opacity-50 h-12 disabled:cursor-not-allowed rounded-[10px]"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loader w-5 h-5 icon"></span>
                    ) : (
                      'Create Team'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false)
          setSelectedUserId(null)
        }}
      />
    </div>
  )
}

export default Teams


