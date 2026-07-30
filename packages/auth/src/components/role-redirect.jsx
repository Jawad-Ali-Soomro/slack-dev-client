import { useEffect, useRef } from 'react'
import { redirectToAppForRole } from '@multi-tenants/config'

export function RoleRedirect({ role }) {
  const redirected = useRef(false)

  useEffect(() => {
    if (!role || redirected.current) {
      return
    }

    redirected.current = true
    redirectToAppForRole(role)
  }, [role])

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Session error. Please log in again.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting to your portal...</p>
    </div>
  )
}
