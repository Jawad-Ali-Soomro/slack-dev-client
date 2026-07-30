import { apiRequest } from './client'

export type PlatformUser = {
  id: number
  username: string
  email: string
  role: 'USER' | 'ADMIN' | 'SUPERADMIN'
  status: 'active' | 'suspended'
  emailVerified: boolean
  emailVerifiedAt?: string | null
  createdAt: string
  avatar?: { url: string } | null
  bookingCount?: number
  organizationCount?: number
}

export type CustomerRecord = {
  id: number | null
  username: string | null
  email: string
  guestName?: string | null
  role?: string | null
  status?: string | null
  emailVerified?: boolean | null
  createdAt?: string | null
  avatar?: { url: string } | null
  isGuest: boolean
  bookingCount: number
  lastBookingAt: string
  organizations: Array<{ id: string; name: string }>
}

export type ListUsersParams = {
  role?: string
  status?: string
  search?: string
}

export type ListCustomersParams = {
  orgId?: string
  search?: string
}

export type UpdateUserPayload = {
  status?: 'active' | 'suspended'
  role?: 'USER' | 'ADMIN'
  emailVerified?: boolean
}

export function listUsersRequest(params: ListUsersParams = {}) {
  const query = new URLSearchParams()
  if (params.role) query.set('role', params.role)
  if (params.status) query.set('status', params.status)
  if (params.search) query.set('search', params.search)

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest<PlatformUser[]>(`/users${suffix}`)
}

export function listCustomersRequest(params: ListCustomersParams = {}) {
  const query = new URLSearchParams()
  if (params.orgId) query.set('orgId', params.orgId)
  if (params.search) query.set('search', params.search)

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest<CustomerRecord[]>(`/customers${suffix}`)
}

export function updateUserRequest(userId: number, payload: UpdateUserPayload) {
  return apiRequest<PlatformUser>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
