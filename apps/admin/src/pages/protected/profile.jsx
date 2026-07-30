import { useUser } from '@multi-tenants/auth'
import { Loading, MyReservations } from '@multi-tenants/ui'

export default function ProfilePage() {
  const { user, isLoading, error } = useUser()

  if (isLoading) {
    return <Loading message="Loading profile..." />
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Profile
      </h1>
      <p className="mt-2 text-zinc-600">
        Your account details and room reservations.
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-zinc-500">Username</p>
        <p className="font-medium text-zinc-900">{user?.username}</p>
        <p className="mt-3 text-sm text-zinc-500">Email</p>
        <p className="font-medium text-zinc-900">{user?.email}</p>
        <p className="mt-3 text-sm text-zinc-500">Role</p>
        <p className="font-medium text-zinc-900">{user?.role}</p>
      </div>

      <MyReservations />
    </div>
  )
}
