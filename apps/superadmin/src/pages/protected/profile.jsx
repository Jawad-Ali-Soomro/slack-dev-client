import { useUser } from '@multi-tenants/auth'
import { Loading } from '@multi-tenants/ui'

export default function ProfilePage() {
  const { user, isLoading, error } = useUser()

  if (isLoading) {
    return <Loading message="Loading profile..." />
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-2 text-gray-600">Protected profile content.</p>
      <p className="mt-4">Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  )
}
