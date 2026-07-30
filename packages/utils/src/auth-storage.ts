const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens({
  accessToken,
  refreshToken,
}: {
  accessToken?: string
  refreshToken?: string
}): void {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function hasCredentials(): boolean {
  return Boolean(getAccessToken() && getRefreshToken())
}

/**
 * localhost:4000 / :5000 / :6100 are different origins — localStorage is not shared.
 * Carry tokens in the URL hash once when crossing apps, then strip the hash.
 */
export function consumeCrossAppAuthHandoff(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) {
    return false
  }

  const params = new URLSearchParams(hash)
  const accessToken = params.get('accessToken')
  const refreshToken = params.get('refreshToken')

  if (!accessToken || !refreshToken) {
    return false
  }

  setTokens({ accessToken, refreshToken })

  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(null, '', cleanUrl)
  return true
}

export function buildAuthHandoffHash(): string {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  if (!accessToken || !refreshToken) {
    return ''
  }

  return new URLSearchParams({ accessToken, refreshToken }).toString()
}
