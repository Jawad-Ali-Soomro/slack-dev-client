import { useUser } from '@multi-tenants/auth'
import { Loading } from '@multi-tenants/ui'

export default function DashboardPage() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return <Loading message="Loading user..." />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Protected dashboard content.</p>
      <p className="mt-4">User: {user?.username ?? user?.email ?? 'Unknown'}</p>
      <p>Role: {user?.role}</p>
    </div>
  )
}
