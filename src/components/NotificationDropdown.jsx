import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Trash2, MoreVertical, Clock, AlertCircle, CheckCircle, Info, RefreshCw, Users, FolderKanban, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { toast } from 'sonner'
import { useNotifications } from '../contexts/NotificationContext'
import invitationService from '../services/invitationService'
import { PiBellDuotone, PiCheckCircleDuotone, PiClockDuotone, PiFolderDuotone, PiInfoDuotone, PiUsersDuotone } from 'react-icons/pi'

const INVITE_TYPES = ['project_invite', 'team_invite', 'PROJECT_INVITE', 'TEAM_INVITE']

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [respondingId, setRespondingId] = useState(null)
  const { 
    notifications, 
    unreadCount, 
    loading, 
    loadNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
  } = useNotifications()

  const handleRespondToInvite = async (notification, action) => {
    const invitation = notification.invitationId
    const invitationId = invitation?._id || invitation?.id || invitation
    if (!invitationId) {
      toast.error('Invitation is no longer available')
      return
    }
    try {
      setRespondingId(notification.id || notification._id)
      await invitationService.respondToInvitation(invitationId, action)
      toast.success(`Invitation ${action === 'accept' ? 'accepted' : 'declined'}!`)
      await markAsRead(notification.id || notification._id)
      await loadNotifications({ force: true })
    } catch (error) {
      toast.error(error.message || `Failed to ${action} invitation`)
    } finally {
      setRespondingId(null)
    }
  }

  const handleOpenChange = (open) => {
    setIsOpen(open)
    if (open) {
      loadNotifications({ force: true })
    }
  }

  const handleRefresh = () => {
    loadNotifications({ force: true })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return <PiCheckCircleDuotone className="w-4 h-4 icon icon text-blue-500" />
      case 'meeting':
        return <PiClockDuotone className="w-4 h-4 icon icon text-green-500" />
      case 'system':
        return <PiInfoDuotone className="w-4 h-4 icon icon text-purple-500" />
      case 'alert':
        return <AlertCircle className="w-4 h-4 icon icon text-red-500" />
      case 'project_invite':
      case 'PROJECT_INVITE':
      case 'project_invite_accepted':
      case 'project_invite_rejected':
        return <PiFolderDuotone className="w-4 h-4 icon icon text-theme" />
      case 'team_invite':
      case 'TEAM_INVITE':
      case 'team_invite_accepted':
      case 'team_invite_rejected':
        return <PiUsersDuotone className="w-4 h-4 icon icon text-theme" />
      default:
        return <PiBellDuotone className="w-4 h-4 icon icon" />
    }
  }

  const getNotificationTitle = (notification) => {
    if (notification.title) return notification.title
    const targetName = notification.invitationId?.targetName
    switch (notification.type) {
      case 'project_invite':
      case 'PROJECT_INVITE':
        return 'Project invitation'
      case 'team_invite':
      case 'TEAM_INVITE':
        return 'Team invitation'
      case 'project_invite_accepted':
      case 'team_invite_accepted':
        return targetName ? `Invitation accepted · ${targetName}` : 'Invitation accepted'
      case 'project_invite_rejected':
      case 'team_invite_rejected':
        return targetName ? `Invitation declined · ${targetName}` : 'Invitation declined'
      case 'task_assigned':
      case 'task_reassigned':
        return 'Task assigned'
      case 'task_updated':
      case 'task_status_updated':
        return 'Task updated'
      case 'task_unassigned':
        return 'Task unassigned'
      case 'meeting_assigned':
      case 'meeting_reassigned':
        return 'Meeting assigned'
      case 'meeting_updated':
      case 'meeting_status_updated':
      case 'meeting_rescheduled':
        return 'Meeting updated'
      case 'user_followed':
        return 'New follower'
      case 'user_unfollowed':
        return 'Unfollowed'
      default:
        return 'Notification'
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }


  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button

          size="sm"
          className="relative rounde-[25px] h-12  mx-2 w-12 bg-white hover:bg-gray-100 hover:border  text-black cursor-pointer rounded-[15px]"
        >
          <Bell className="w-5 h-5 icon" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-[15px] text-[10px] text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 rounded-[15px] p-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 icon">
            <div className="flex items-center justify-between">
            <h3 className="text-lg  text-gray-900 dark:text-white font-bold">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="p-1 h-6 w-6 text-gray-500 hover:text-blue-600"
                  disabled={loading}
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
             
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Mark all read
                </Button>
              )}
             
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-[15px] h-6 w-6 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={`${notification.id || notification._id || index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-black transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.isRead 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {getNotificationTitle(notification)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {getTimeAgo(notification.createdAt)}
                          </p>

                          {INVITE_TYPES.includes(notification.type) &&
                            (() => {
                              const invitation = notification.invitationId
                              const status = invitation?.status
                              const isResponding =
                                respondingId === (notification.id || notification._id)

                              if (!invitation) return null

                              if (status && status !== 'pending') {
                                return (
                                  <span
                                    className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold ${
                                      status === 'accepted'
                                        ? 'text-green-600'
                                        : 'text-red-500'
                                    }`}
                                  >
                                    {status === 'accepted' ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      <X className="w-3 h-3" />
                                    )}
                                    {status === 'accepted' ? 'Accepted' : 'Declined'}
                                  </span>
                                )
                              }

                              return (
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    disabled={isResponding}
                                    onClick={() =>
                                      handleRespondToInvite(notification, 'accept')
                                    }
                                    className="h-7 px-3 rounded-[10px] bg-theme hover:bg-theme text-white text-xs"
                                  >
                                    {isResponding ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Check className="w-3 h-3 mr-1" />
                                        Accept
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isResponding}
                                    onClick={() =>
                                      handleRespondToInvite(notification, 'reject')
                                    }
                                    className="h-7 px-3 rounded-[10px] text-xs"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              )
                            })()}
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id || notification._id)}
                              className="p-1 h-6 w-6 text-gray-400 hover:text-green-600"
                            >
                              <Check className="w-3 h-3 icon" />
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical className="w-3 h-3 icon" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              {!notification.isRead && (
                                <DropdownMenuItem
                                  onClick={() => markAsRead(notification.id || notification._id)}
                                  className="text-xs"
                                >
                                  <Check className="w-3 h-3 icon mr-2" />
                                  Mark read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => deleteNotification(notification.id || notification._id)}
                                className="text-xs text-red-600"
                              >
                                <Trash2 className="w-3 h-3 icon mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>       
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown
