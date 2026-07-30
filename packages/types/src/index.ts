export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'EMPLOYEE'

export type AppId = 'admin' | 'superadmin' | 'tenant'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: number
  username: string
  email: string
  role: UserRole | string
  emailVerified?: boolean
  emailVerifiedAt?: string | null
  avatar?: {
    id?: string
    url?: string
  } | null
  ownedOrganizations?: Array<{ id: string; name: string }>
  memberships?: Array<{
    organization?: { id: string; name: string }
  }>
  createdAt?: string
}

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}
