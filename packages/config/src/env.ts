const REQUIRED_ENV_KEYS = [
  'VITE_API_BASE_URL',
  'VITE_ADMIN_URL',
  'VITE_SUPERADMIN_URL',
  'VITE_TENANTS_URL',
] as const

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number]
type RawEnv = Record<RequiredEnvKey, string | undefined>

function readRawEnv(): RawEnv {
  return {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_ADMIN_URL: import.meta.env.VITE_ADMIN_URL,
    VITE_SUPERADMIN_URL: import.meta.env.VITE_SUPERADMIN_URL,
    VITE_TENANTS_URL: import.meta.env.VITE_TENANTS_URL,
  }
}

function assertEnv(raw: RawEnv): asserts raw is Record<RequiredEnvKey, string> {
  const missing = REQUIRED_ENV_KEYS.filter((key) => {
    const value = raw[key]
    return typeof value !== 'string' || value.trim().length === 0
  })

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
        'Add them to each app .env file.',
    )
  }
}

export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

const rawEnv = readRawEnv()
assertEnv(rawEnv)

export const env = {
  API_BASE_URL: normalizeBaseUrl(rawEnv.VITE_API_BASE_URL),
  ADMIN_URL: normalizeBaseUrl(rawEnv.VITE_ADMIN_URL),
  SUPERADMIN_URL: normalizeBaseUrl(rawEnv.VITE_SUPERADMIN_URL),
  TENANTS_URL: normalizeBaseUrl(rawEnv.VITE_TENANTS_URL),
} as const

export type Env = typeof env
