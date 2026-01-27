import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Trash2, MoreVertical, Clock, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { toast } from 'sonner'
import { useNotifications } from '../contexts/NotificationContext'
import { createTestNotification } from '../utils/testNotifications'

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    notifications, 
    unreadCount, 
    loading, 
    loadNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteAllNotifications,
    addNotification 
  } = useNotifications()

  // Add test notification
  const handleAddTestNotification = (type) => {
    const testNotification = createTestNotification(type)
    addNotification(testNotification)
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

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return <CheckCircle className="w-4 h-4 icon text-blue-500" />
      case 'meeting':
        return <Clock className="w-4 h-4 icon text-green-500" />
      case 'system':
        return <Info className="w-4 h-4 icon text-purple-500" />
      case 'alert':
        return <AlertCircle className="w-4 h-4 icon text-red-500" />
      default:
        return <Bell className="w-4 h-4 icon" />
    }
  }

  // Format time ago
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
          // variant="ghost"
          size="sm"
          className="relative rounde-[25px] h-12  mx-2 w-12 bg-white hover:bg-gray-100 hover:border  text-black cursor-pointer rounded-full"
        >
          <Bell className="w-5 h-5 icon" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-[10px] text-[10px] text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 rounded-[20px] p-0"
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
              <div className="animate-spin rounded-[10px] h-6 w-6 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
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
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {getTimeAgo(notification.createdAt)}
                          </p>
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
