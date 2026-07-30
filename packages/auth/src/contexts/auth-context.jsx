import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  loginRequest,
  logoutRequest,
  registerRequest,
} from '@multi-tenants/api'
import {
  clearTokens,
  consumeCrossAppAuthHandoff,
  getAccessToken,
  getRefreshToken,
  hasCredentials,
  setTokens,
} from '@multi-tenants/utils'

// Run before any child provider effects so /auth/me sees handed-off tokens.
consumeCrossAppAuthHandoff()

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasCredentials())

  const syncAuthState = useCallback(() => {
    setIsAuthenticated(hasCredentials())
  }, [])

  useEffect(() => {
    // Catch a late hash if navigation landed after first module eval.
    if (consumeCrossAppAuthHandoff()) {
      syncAuthState()
    }
    setIsLoading(false)
  }, [syncAuthState])

  const register = async (payload) => registerRequest(payload)

  const login = async (credentials) => {
    const data = await loginRequest(credentials)
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })
    setIsAuthenticated(true)
    return data
  }

  const logout = async () => {
    const refreshToken = getRefreshToken()

    if (refreshToken) {
      try {
        await logoutRequest(refreshToken)
      } catch {
        // Clear local session even if logout request fails.
      }
    }

    clearTokens()
    setIsAuthenticated(false)
  }

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated: isAuthenticated || hasCredentials(),
      accessToken: getAccessToken(),
      login,
      register,
      logout,
      syncAuthState,
    }),
    [isLoading, isAuthenticated, syncAuthState],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
