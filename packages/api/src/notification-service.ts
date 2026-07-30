import { apiRequest } from './client'

export type AppNotification = {
  id: string
  userId: number
  title: string
  message: string
  type: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

export async function listNotificationsRequest() {
  return apiRequest<AppNotification[]>('/notifications')
}

export async function unreadNotificationCountRequest() {
  return apiRequest<{ count: number }>('/notifications/unread-count')
}

export async function markNotificationReadRequest(id: string) {
  return apiRequest<AppNotification>(`/notifications/${id}/read`, {
    method: 'PATCH',
  })
}

export async function markAllNotificationsReadRequest() {
  return apiRequest<{ message: string }>('/notifications/read-all', {
    method: 'PATCH',
  })
}
