import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi'
import { getAssetUrl } from '@multi-tenants/config'
import { formatRoleLabel } from '@multi-tenants/utils'
import { useAuth, useUser } from '@multi-tenants/auth'
import { useSidebar } from '../contexts/sidebar-context.jsx'

function getOrganizationName(user) {
  return (
    user?.ownedOrganizations?.[0]?.name ??
    user?.memberships?.[0]?.organization?.name ??
    null
  )
}

function getAvatarSrc(user) {
  if (!user?.avatar?.url) {
    return '/avatar.webp'
  }

  return getAssetUrl(user.avatar.url)
}

function badgeToneClass(tone) {
  switch (tone) {
    case 'orange':
      return 'bg-[#ffe4c8] text-[#1f1f1f]'
    case 'green':
      return 'bg-[#d8f5d3] text-[#1f1f1f]'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function SidebarLink({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      end={item.end ?? item.to === '/dashboard'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'group flex w-full items-center gap-3 rounded-2xl py-2.5 text-[15px] transition',
          collapsed ? 'justify-center px-2' : 'px-3',
          isActive
            ? 'bg-white font-semibold text-gray-900'
            : 'font-medium text-gray-500 hover:bg-white/70 hover:text-gray-800',
        ].join(' ')
      }
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[1.15rem] text-current">
        {item.icon}
      </span>
      {!collapsed ? (
        <>
          <span className="truncate">{item.label}</span>
          {item.badge ? (
            <span
              className={`ml-auto rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-none ${
                item.badge.className ?? badgeToneClass(item.badge.tone)
              }`}
            >
              {item.badge.label}
            </span>
          ) : null}
        </>
      ) : null}
    </NavLink>
  )
}

function SidebarGroup({ item, forceOpen, collapsed }) {
  const location = useLocation()
  const children = item.items ?? []
  const isChildActive = children.some((child) => {
    if (child.end) {
      return location.pathname === child.to
    }
    return (
      location.pathname === child.to ||
      location.pathname.startsWith(`${child.to}/`)
    )
  })
  const [open, setOpen] = useState(forceOpen || isChildActive || Boolean(item.defaultOpen))

  useEffect(() => {
    if (isChildActive) {
      setOpen(true)
    }
  }, [isChildActive])

  if (collapsed) {
    const firstChild = children[0]
    if (!firstChild) {
      return null
    }

    return (
      <NavLink
        to={firstChild.to}
        title={item.label}
        className={({ isActive }) =>
          [
            'flex w-full items-center justify-center rounded-2xl px-2 py-2.5 transition',
            isActive || isChildActive
              ? 'bg-white font-semibold text-gray-900'
              : 'font-medium text-gray-500 hover:bg-white/70 hover:text-gray-800',
          ].join(' ')
        }
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[1.15rem]">
          {item.icon}
        </span>
      </NavLink>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={[
          'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[15px] transition',
          open || isChildActive
            ? 'font-semibold text-gray-900'
            : 'font-medium text-gray-500 hover:text-gray-800',
        ].join(' ')}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[1.15rem]">
          {item.icon}
        </span>
        <span className="flex-1 truncate">{item.label}</span>
        <FiChevronDown
          className={`icon h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="sidebar-tree relative ml-[1.35rem] mt-1 space-y-1 border-l icon border-gray-200 pb-1 pl-4">
            {children.map((child) => (
              <li key={`${child.to}-${child.label}`} className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-4 top-1/2 h-px w-4 -translate-y-1/2 bg-gray-200"
                />
                <NavLink
                  to={child.to}
                  end={child.end ?? true}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 rounded-2xl px-3 py-2 text-[14px] transition',
                      isActive
                        ? 'bg-white font-semibold text-gray-900'
                        : 'font-medium text-gray-500 hover:bg-white/70 hover:text-gray-800',
                    ].join(' ')
                  }
                >
                  <span className="truncate">{child.label}</span>
                  {child.badge ? (
                    <span
                      className={`ml-auto rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-none ${
                        child.badge.className ?? badgeToneClass(child.badge.tone)
                      }`}
                    >
                      {child.badge.label}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ items = [] }) {
  const { user, isLoading } = useUser()
  const { logout } = useAuth()
  const { isCollapsed, toggle } = useSidebar()

  const displayName = user?.username ?? user?.email ?? 'User'
  const roleLabel = formatRoleLabel(user?.role)
  const organizationName = getOrganizationName(user)

  return (
    <aside
      className={[
        'fixed z-20 flex h-screen flex-col bg-[#f3f3f3] py-4 text-gray-700 transition-[width] duration-200 ease-out',
        isCollapsed ? 'w-[4.5rem] px-2' : 'w-64 px-3',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-4 -translate-y-1/2 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
      >
        {isCollapsed ? (
          <FiChevronRight className="icon h-3.5 w-3.5" />
        ) : (
          <FiChevronLeft className="icon h-3.5 w-3.5" />
        )}
      </button>

      <div
        className={[
          'mb-4 flex items-center bg-white gap-3 rounded-2xl py-2',
          isCollapsed ? 'justify-center px-0' : 'px-2',
        ].join(' ')}
      >
        <img
          src={getAvatarSrc(user)}
          alt={displayName}
          className="h-10 w-10 shrink-0 rounded-full bg-white object-cover"
          title={isCollapsed ? displayName : undefined}
        />
        {!isCollapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {isLoading ? 'Loading...' : displayName}
            </p>
            <p className="truncate text-xs text-gray-500">
              {isLoading ? '...' : user?.email}
              {organizationName ? ` · ${organizationName}` : ''}
            </p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-0.5 pb-4">
        {items.map((item) => {
          const hasChildren = Array.isArray(item.items) && item.items.length > 0

          if (hasChildren) {
            return (
              <SidebarGroup
                key={item.label}
                item={item}
                collapsed={isCollapsed}
              />
            )
          }

          return (
            <SidebarLink
              key={`${item.to}-${item.label}`}
              item={item}
              collapsed={isCollapsed}
            />
          )
        })}
      </nav>

      <button
        type="button"
        onClick={() => logout()}
        title={isCollapsed ? 'Logout' : undefined}
        className={[
          'mb-1 flex items-center gap-3 rounded-2xl py-2.5 text-[15px] font-medium text-gray-500 transition hover:bg-white hover:text-red-500',
          isCollapsed ? 'mx-0 justify-center px-2' : 'mx-1 px-3',
        ].join(' ')}
      >
        <FiLogOut className="icon shrink-0 text-[1.1rem]" />
        {!isCollapsed ? 'Logout' : null}
      </button>
    </aside>
  )
}
