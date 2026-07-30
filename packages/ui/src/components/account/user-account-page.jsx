import { NavLink } from 'react-router-dom'
import {
  PiBed,
  PiShoppingBag,
  PiUser,
} from 'react-icons/pi'
import { cn } from '@multi-tenants/utils'
import Loading from '../loading.jsx'
import { useUser } from '@multi-tenants/auth'
import MyReservations from '../hotel/my-reservations.jsx'
import MyOrders from './my-orders.jsx'
import UserProfileSection from './user-profile-section.jsx'

const SECTIONS = [
  {
    key: 'profile',
    to: '/profile',
    label: 'Profile',
    icon: PiUser,
    title: 'My account',
    description: 'Manage your profile, email, and active sessions.',
  },
  {
    key: 'bookings',
    to: '/bookings',
    label: 'Bookings',
    icon: PiBed,
    title: 'My bookings',
    description: 'Room reservations and their approval status.',
  },
  {
    key: 'orders',
    to: '/orders',
    label: 'Orders',
    icon: PiShoppingBag,
    title: 'My orders',
    description: 'Shop purchases from the marketplace.',
  },
]

export default function UserAccountPage({ section = 'profile' }) {
  const { isLoading, error } = useUser()
  const active = SECTIONS.find((item) => item.key === section) ?? SECTIONS[0]

  if (isLoading) {
    return <Loading message="Loading your account..." />
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {active.title}
        </h1>
        <p className="mt-2 text-zinc-600">{active.description}</p>
      </div>

      <nav className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-2">
        {SECTIONS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.key}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-zinc-600 hover:bg-zinc-50',
                )
              }
            >
              <Icon className="icon size-4 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {section === 'profile' ? <UserProfileSection /> : null}
      {section === 'bookings' ? <MyReservations embedded /> : null}
      {section === 'orders' ? <MyOrders embedded /> : null}
    </div>
  )
}
