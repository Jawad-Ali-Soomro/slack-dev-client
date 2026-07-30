import { useEffect } from 'react'
import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { canAccessApp } from '@multi-tenants/config'
import { clearTokens, hasCredentials } from '@multi-tenants/utils'
import { RoleRedirect } from '../components/role-redirect'
import { useAuth } from '../contexts/auth-context'
import { useLoginModal } from '../contexts/auth-modal-context'
import { useUser } from '../contexts/user-context'

export function PublicProvider({ appId, allowAuthenticatedBrowse = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, isLoading: authLoading, syncAuthState } = useAuth()
  const { user, isLoading: userLoading } = useUser()
  const { openLoginModal } = useLoginModal()
  const authenticated = isAuthenticated || hasCredentials()

  useEffect(() => {
    if (searchParams.get('login') === '1' && !authenticated) {
      openLoginModal({ stayOnPage: true })
      searchParams.delete('login')
      setSearchParams(searchParams, { replace: true })
    }
  }, [authenticated, openLoginModal, searchParams, setSearchParams])

  if (authLoading || (authenticated && userLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking session...</p>
      </div>
    )
  }

  if (authenticated) {
    // Bad/partial session — stay here, do not hop ports.
    if (!user?.role) {
      clearTokens()
      syncAuthState?.()
      return <Outlet />
    }

    if (!canAccessApp(appId, user.role)) {
      return <RoleRedirect role={user.role} />
    }

    // Tenant marketplace: stay on public pages while logged in
    if (allowAuthenticatedBrowse || appId === 'tenant') {
      return <Outlet />
    }

    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
