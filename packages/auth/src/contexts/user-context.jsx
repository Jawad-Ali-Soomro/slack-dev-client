import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { meRequest } from '@multi-tenants/api'
import { hasCredentials } from '@multi-tenants/utils'
import { useAuth } from './auth-context'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated && !hasCredentials()) {
      setUser(null)
      setError(null)
      setIsLoading(false)
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await meRequest()
      const nextUser = data.user ?? null
      setUser(nextUser)
      return nextUser
    } catch (err) {
      setUser(null)
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (authLoading) {
      return
    }

    fetchUser()
  }, [authLoading, fetchUser])

  const value = useMemo(
    () => ({
      user,
      isLoading: authLoading || isLoading,
      error,
      refreshUser: fetchUser,
      clearUser: () => setUser(null),
    }),
    [user, authLoading, isLoading, error, fetchUser],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }

  return context
}
