// Simple test notification generator for manual testing
export const createTestNotification = (type = 'task') => {
  const notifications = {
    task: {
      id: `test-task-${Date.now()}`,
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Test Task"',
      type: 'task',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    meeting: {
      id: `test-meeting-${Date.now()}`,
      title: 'Meeting Reminder',
      message: 'Team standup meeting starts in 15 minutes',
      type: 'meeting',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    system: {
      id: `test-system-${Date.now()}`,
      title: 'System Update',
      message: 'The application has been updated to version 2.1.0',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    alert: {
      id: `test-alert-${Date.now()}`,
      title: 'Alert: High Priority',
      message: 'Server response time is slower than usual',
      type: 'alert',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  }

  return notifications[type] || notifications.task
}

// Add test notification to the global window object for easy testing in console
if (typeof window !== 'undefined') {
  window.addTestNotification = (type) => {
    // This will be used by the notification context
    console.log('Test notification created:', createTestNotification(type))
    return createTestNotification(type)
  }
}
