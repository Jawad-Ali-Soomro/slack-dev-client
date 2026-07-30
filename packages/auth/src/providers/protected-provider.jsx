import { Navigate, Outlet } from 'react-router-dom'
import { canAccessApp } from '@multi-tenants/config'
import { clearTokens, hasCredentials } from '@multi-tenants/utils'
import { RoleRedirect } from '../components/role-redirect'
import { useAuth } from '../contexts/auth-context'
import { useUser } from '../contexts/user-context'

export function ProtectedProvider({ appId }) {
  const { isAuthenticated, isLoading: authLoading, syncAuthState } = useAuth()
  const { user, isLoading: userLoading, error } = useUser()
  const authenticated = isAuthenticated || hasCredentials()

  if (authLoading || (authenticated && userLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking session...</p>
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/?login=1" replace />
  }

  // Tokens exist but /auth/me failed or returned no role — do NOT bounce to another port.
  if (!user?.role) {
    clearTokens()
    syncAuthState?.()
    return <Navigate to="/?login=1" replace />
  }

  if (!canAccessApp(appId, user.role)) {
    return <RoleRedirect role={user.role} />
  }

  if (error && !user) {
    return <Navigate to="/?login=1" replace />
  }

  return <Outlet />
}
