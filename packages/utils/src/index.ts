export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

export function formatRoleLabel(role?: string | null): string {
  if (!role) {
    return 'Member'
  }

  const labels: Record<string, string> = {
    SUPERADMIN: 'Super Admin',
    ADMIN: 'Admin',
    OWNER: 'Owner',
    MANAGER: 'Manager',
    MEMBER: 'Member',
    GUEST: 'Guest',
    LEAD: 'Lead',
    EMPLOYEE: 'Employee',
    USER: 'User',
    BUSINESS: 'Business',
  }

  return labels[role] ?? role
}

export {
  buildAuthHandoffHash,
  clearTokens,
  consumeCrossAppAuthHandoff,
  getAccessToken,
  getRefreshToken,
  hasCredentials,
  setTokens,
} from './auth-storage'
