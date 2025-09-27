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
  const [unreadCounts, setUnreadCounts] = useState({
    tasks: 0,
    meetings: 0,
    projects: 0,
    teams: 0,
    messages: 0,
    code: 0
  })

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await notificationService.getNotifications()
      console.log('Loaded notifications:', response)
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
    
    // Update specific counts by type
    const counts = {
      tasks: 0,
      meetings: 0,
      projects: 0,
      teams: 0,
      messages: 0,
      code: 0
    }
    
    notificationsList.forEach(notif => {
      if (!notif.isRead) {
        const type = notif.type || notif.notificationType || 'general'
        switch (type) {
          case 'task':
          case 'task_assigned':
          case 'task_updated':
          case 'task_completed':
          case 'TASK_ASSIGNED':
          case 'TASK_UPDATED':
          case 'TASK_COMPLETED':
            counts.tasks++
            break
          case 'meeting':
          case 'meeting_invite':
          case 'meeting_reminder':
          case 'MEETING_INVITE':
          case 'MEETING_REMINDER':
            counts.meetings++
            break
          case 'project':
          case 'project_invite':
          case 'project_updated':
          case 'PROJECT_INVITE':
          case 'PROJECT_UPDATED':
            counts.projects++
            break
          case 'team':
          case 'team_invite':
          case 'team_updated':
          case 'TEAM_INVITE':
          case 'TEAM_UPDATED':
            counts.teams++
            break
          case 'message':
          case 'chat':
          case 'MESSAGE':
          case 'CHAT':
            counts.messages++
            break
          case 'code':
          case 'code_invite':
          case 'code_session':
          case 'CODE_INVITE':
          case 'CODE_SESSION':
            counts.code++
            break
        }
      }
    })
    
    console.log('Updated unread counts:', counts)
    setUnreadCounts(counts)
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
    const notificationType = notification.type || 'info'
    const title = notification.title || 'New Notification'
    const message = notification.message || ''
    
    if (notificationType === 'message') {
      toast.info(`💬 ${title}`, {
        description: message,
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to chat if needed
            window.location.href = '/dashboard/chat'
          }
        }
      })
    } else {
      toast.info(title, {
        description: message,
        duration: 5000,
      })
    }
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
      console.log('User authenticated, loading notifications...')
      loadNotifications()
    } else {
      // Clear notifications when user logs out
      console.log('User not authenticated, clearing notifications...')
      setNotifications([])
      setUnreadCount(0)
      setUnreadCounts({
        tasks: 0,
        meetings: 0,
        projects: 0,
        teams: 0,
        messages: 0,
        code: 0
      })
    }
  }, [user, loadNotifications])

  // Set up periodic refresh of notifications every 30 seconds when user is authenticated
  useEffect(() => {
    if (!user) return

    console.log('Setting up notification refresh interval...')
    const interval = setInterval(() => {
      console.log('Refreshing notifications...')
      loadNotifications()
    }, 30000) // 30 seconds

    return () => {
      console.log('Clearing notification refresh interval...')
      clearInterval(interval)
    }
  }, [user, loadNotifications])

  const value = {
    notifications,
    unreadCount,
    unreadCounts,
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
