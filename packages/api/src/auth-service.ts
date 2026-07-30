import type {
  AuthTokens,
  AuthUser,
  LoginCredentials,
  RegisterPayload,
} from '@multi-tenants/types'
import { apiRequest } from './client'

type LoginResponse = AuthTokens & {
  sessionId?: string
}

type MeResponse = {
  message: string
  user: AuthUser
}

type RegisterResponse = {
  message: string
  user: AuthUser
}

export async function loginRequest(credentials: LoginCredentials) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export async function registerRequest(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logoutRequest(refreshToken: string) {
  return apiRequest('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

export async function meRequest() {
  return apiRequest<MeResponse>('/auth/me')
}
