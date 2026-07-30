import type { AppId, UserRole } from '@multi-tenants/types'
import { env, normalizeBaseUrl } from './env'

export const APP_ROUTES = {
  admin: env.ADMIN_URL,
  superAdmin: env.SUPERADMIN_URL,
  tenant: env.TENANTS_URL,
} as const

export type AppRouteKey = keyof typeof APP_ROUTES

/** Roles allowed on each frontend application. */
export const APP_ALLOWED_ROLES: Record<AppId, readonly string[]> = {
  admin: ['ADMIN', 'OWNER', 'MANAGER', 'EMPLOYEE'],
  superadmin: ['SUPERADMIN'],
  tenant: ['USER'],
}

const KNOWN_ROLES = new Set([
  'USER',
  'ADMIN',
  'SUPERADMIN',
  'OWNER',
  'MANAGER',
  'EMPLOYEE',
])

export function joinUrl(base: string, path = ''): string {
  const normalizedBase = normalizeBaseUrl(base)

  if (!path || path.trim() === '' || path === '/') {
    return normalizedBase
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${normalizedBase}/${path.replace(/^\/+/, '')}`
}

export function getApiUrl(path = ''): string {
  return joinUrl(env.API_BASE_URL, path)
}

export function getApiOrigin(): string {
  return env.API_BASE_URL.replace(/\/api\/v\d+$/i, '')
}

export function getAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return joinUrl(getApiOrigin(), path)
}

export function redirectToAdmin(path = ''): void {
  redirectAcrossApps(APP_ROUTES.admin, path)
}

export function redirectToSuperAdmin(path = ''): void {
  redirectAcrossApps(APP_ROUTES.superAdmin, path)
}

export function redirectToTenant(path = ''): void {
  redirectAcrossApps(APP_ROUTES.tenant, path)
}

/** Returns null when role is missing/unknown — never guess tenant. */
export function getAppIdForRole(role?: string | null): AppId | null {
  if (!role || !KNOWN_ROLES.has(role)) {
    return null
  }

  switch (role as UserRole | string) {
    case 'SUPERADMIN':
      return 'superadmin'
    case 'ADMIN':
    case 'OWNER':
    case 'MANAGER':
    case 'EMPLOYEE':
      return 'admin'
    case 'USER':
      return 'tenant'
    default:
      return null
  }
}

export function getAppUrlForRole(role?: string | null): string | null {
  const appId = getAppIdForRole(role)

  if (!appId) {
    return null
  }

  switch (appId) {
    case 'superadmin':
      return APP_ROUTES.superAdmin
    case 'admin':
      return APP_ROUTES.admin
    case 'tenant':
      return APP_ROUTES.tenant
    default:
      return null
  }
}

function isCurrentApp(targetUrl: string): boolean {
  try {
    const target = new URL(targetUrl)
    const { origin, hostname, port } = window.location

    if (target.origin === origin) {
      return true
    }

    // Dev: localhost and 127.0.0.1 are the same machine/port.
    const localHosts = new Set(['localhost', '127.0.0.1'])
    if (
      localHosts.has(target.hostname) &&
      localHosts.has(hostname) &&
      (target.port || defaultPort(target.protocol)) === (port || defaultPort(window.location.protocol))
    ) {
      return true
    }

    return false
  } catch {
    return false
  }
}

function defaultPort(protocol: string): string {
  return protocol === 'https:' ? '443' : '80'
}

function redirectAcrossApps(base: string, path = ''): void {
  const target = joinUrl(base, path)

  // Already on this app — never full-page reload-loop.
  if (isCurrentApp(target)) {
    return
  }

  try {
    const url = new URL(target)
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (accessToken && refreshToken) {
      url.hash = new URLSearchParams({ accessToken, refreshToken }).toString()
    }

    window.location.replace(url.toString())
  } catch {
    window.location.replace(target)
  }
}

/**
 * Cross-app redirect for a known role.
 * No-ops when role is missing or the browser is already on the right origin.
 */
export function redirectToAppForRole(role?: string | null, path = ''): void {
  const targetBase = getAppUrlForRole(role)

  if (!targetBase) {
    return
  }

  redirectAcrossApps(targetBase, path)
}

export function canAccessApp(appId: AppId, role?: string | null): boolean {
  if (!role) {
    return false
  }

  return APP_ALLOWED_ROLES[appId].includes(role)
}

export function navigateAfterAuth(
  appId: AppId,
  role: string | null | undefined,
  navigate: (to: string, options?: { replace?: boolean }) => void,
): void {
  if (canAccessApp(appId, role)) {
    const path = appId === 'tenant' ? '/profile' : '/dashboard'
    navigate(path, { replace: true })
    return
  }

  redirectToAppForRole(role)
}

export { env, normalizeBaseUrl } from './env'
