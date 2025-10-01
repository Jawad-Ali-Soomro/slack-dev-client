import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus,
  Search, 
  UserPlus, 
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import friendService from '../services/friendService'
import { useAuth } from '../contexts/AuthContext'
import { getAvatarProps } from '../utils/avatarUtils'
import UserDetailsModal from './UserDetailsModal'
import { getButtonClasses, getInputClasses, ICON_SIZES } from '../utils/uiConstants'

const FindFriendsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)

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
      onClose()
      window.location.reload()
    } catch (error) {
      toast.error(error.message || 'Failed to send friend request')
    }
  }

  // Handle user avatar click
  const handleUserAvatarClick = (userId) => {
    console.log('FindFriends avatar clicked for user ID:', userId)
    setSelectedUserId(userId)
    setShowUserDetails(true)
    console.log('Modal should open now')
  }

  // Search users when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setSearchResults([])
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-sm  z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-lg border-2 shadow-xl w-full max-w-xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Find Friends
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Search for people to connect with
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Search Input */}
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

            {/* Search Results */}
            {searchResults.length === 0 && searchTerm ? (
              <div className="text-center py-8 text-gray-500">
                No users found matching "{searchTerm}"
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar 
                        className="cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => handleUserAvatarClick(user.id)}
                        title={`View ${user.username}'s profile`}
                      >
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
                      className={getButtonClasses('primary', 'sm', 'w-12')}
                    >
                      <Plus className={ICON_SIZES.sm} />
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Start typing to search for friends
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false)
          setSelectedUserId(null)
        }}
      />
    </>
  )
}

export default FindFriendsModal
