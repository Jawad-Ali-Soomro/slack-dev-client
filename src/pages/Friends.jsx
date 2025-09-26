import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  UserPlus, 
  Check, 
  X, 
  Users, 
  UserCheck, 
  Clock,
  Trash2,
  Send
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import friendService from '../services/friendService'
import { useAuth } from '../contexts/AuthContext'
import { getAvatarProps } from '../utils/avatarUtils'
import { getButtonClasses, getInputClasses, COLOR_THEME, ICON_SIZES } from '../utils/uiConstants'

const Friends = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('friends')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [stats, setStats] = useState(null)

  // Load friends
  const loadFriends = async () => {
    try {
      setLoading(true)
      const response = await friendService.getFriends()
      setFriends(response.friends || [])
    } catch (error) {
      console.error('Error loading friends:', error)
      toast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  // Load friend requests
  const loadFriendRequests = async () => {
    try {
      const response = await friendService.getFriendRequests()
      setFriendRequests(response.requests || [])
    } catch (error) {
      console.error('Error loading friend requests:', error)
      toast.error('Failed to load friend requests')
    }
  }

  // Load stats
  const loadStats = async () => {
    try {
      const response = await friendService.getFriendStats()
      setStats(response.stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Search users
  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await friendService.searchUsersForFriends(searchTerm)
      setSearchResults(response.users || [])
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    }
  }

  // Send friend request
  const handleSendFriendRequest = async (userId) => {
    try {
      await friendService.sendFriendRequest(userId)
      toast.success('Friend request sent!')
      loadFriendRequests()
      loadStats()
    } catch (error) {
      toast.error(error.message || 'Failed to send friend request')
    }
  }

  // Respond to friend request
  const handleRespondToRequest = async (requestId, action) => {
    try {
      await friendService.respondToFriendRequest(requestId, action)
      toast.success(`Friend request ${action}ed!`)
      loadFriendRequests()
      loadFriends()
      loadStats()
    } catch (error) {
      toast.error(error.message || `Failed to ${action} friend request`)
    }
  }

  // Remove friend
  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return
    }

    try {
      await friendService.removeFriend(friendId)
      toast.success('Friend removed!')
      loadFriends()
      loadStats()
    } catch (error) {
      toast.error(error.message || 'Failed to remove friend')
    }
  }

  // Load data on mount
  useEffect(() => {
    loadFriends()
    loadFriendRequests()
    loadStats()
  }, [])

  // Search users when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const pendingReceivedRequests = friendRequests.filter(req => 
    req.receiver.id === user?.id && req.status === 'pending'
  )

  const pendingSentRequests = friendRequests.filter(req => 
    req.sender.id === user?.id && req.status === 'pending'
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Friends
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your friends and friend requests
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Friends</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFriends}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Received</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReceivedRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingSentRequests}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
            <TabsTrigger value="received">
              Received ({pendingReceivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({pendingSentRequests.length})
            </TabsTrigger>
            <TabsTrigger value="search">Find Friends</TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Friends</CardTitle>
                <CardDescription>
                  People you're connected with
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading friends...</div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No friends yet. Start by finding people to connect with!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friendship) => (
                      <motion.div
                        key={friendship.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Avatar>
                          <AvatarImage {...getAvatarProps(friendship.friend.avatar, friendship.friend.username)} />
                          <AvatarFallback>
                            {friendship.friend.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {friendship.friend.username}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {friendship.friend.email}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFriend(friendship.friend.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Received Requests Tab */}
          <TabsContent value="received" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Received Requests</CardTitle>
                <CardDescription>
                  Friend requests waiting for your response
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingReceivedRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending friend requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReceivedRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage {...getAvatarProps(request.sender.avatar, request.sender.username)} />
                            <AvatarFallback>
                              {request.sender.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {request.sender.username}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {request.sender.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleRespondToRequest(request.id, 'accept')}
                            className={getButtonClasses('primary', 'sm', '')}
                          >
                            <Check className={ICON_SIZES.sm} />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRespondToRequest(request.id, 'reject')}
                            className={getButtonClasses('danger', 'sm', '')}
                          >
                            <X className={ICON_SIZES.sm} />
                            Decline
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sent Requests Tab */}
          <TabsContent value="sent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sent Requests</CardTitle>
                <CardDescription>
                  Friend requests you've sent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingSentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending sent requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSentRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage {...getAvatarProps(request.receiver.avatar, request.receiver.username)} />
                            <AvatarFallback>
                              {request.receiver.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {request.receiver.username}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {request.receiver.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-yellow-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Friends</CardTitle>
                <CardDescription>
                  Search for people to connect with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by username or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={getInputClasses('default', 'md', 'pl-10')}
                    />
                  </div>
                </div>

                {searchResults.length === 0 && searchTerm ? (
                  <div className="text-center py-8 text-gray-500">
                    No users found matching "{searchTerm}"
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage {...getAvatarProps(user.avatar, user.username)} />
                            <AvatarFallback>
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleSendFriendRequest(user.id)}
                          className={getButtonClasses('primary', 'sm', '')}
                        >
                          <UserPlus className={ICON_SIZES.sm} />
                          Add Friend
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Friends

