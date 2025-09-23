import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import notificationService from '../services/notificationService'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await notificationService.getNotifications()
      setNotifications(response.notifications || [])
      updateUnreadCount(response.notifications || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update unread count
  const updateUnreadCount = (notificationsList) => {
    const unread = notificationsList.filter(notif => !notif.isRead).length
    setUnreadCount(unread)
  }

  // Add new notification
  const addNotification = (notification) => {
    setNotifications(prev => {
      // Check if notification already exists to prevent duplicates
      const notificationId = notification.id || notification._id
      const exists = prev.some(notif => (notif.id || notif._id) === notificationId)
      if (exists) {
        return prev
      }
      
      const updated = [notification, ...prev]
      updateUnreadCount(updated)
      return updated
    })
    
    // Show toast for new notification
    toast.info(notification.title, {
      description: notification.message,
      duration: 5000,
    })
  }

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => {
        const updated = prev.map(notif => 
          (notif.id || notif._id) === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
        updateUnreadCount(updated)
        return updated
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => {
        const updated = prev.map(notif => ({ ...notif, isRead: true }))
        updateUnreadCount(updated)
        return updated
      })
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(prev => {
        const updated = prev.filter(notif => notif.id !== notificationId)
        updateUnreadCount(updated)
        return updated
      })
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications()
      setNotifications([])
      setUnreadCount(0)
      toast.success('All notifications deleted')
    } catch (error) {
      console.error('Failed to delete all notifications:', error)
      toast.error('Failed to delete all notifications')
    }
  }

  // Load notifications automatically when user is authenticated
  useEffect(() => {
    if (user) {
      loadNotifications()
    } else {
      // Clear notifications when user logs out
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user, loadNotifications])

  // Set up periodic refresh of notifications every 30 seconds when user is authenticated
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      loadNotifications()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, loadNotifications])

  const value = {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
