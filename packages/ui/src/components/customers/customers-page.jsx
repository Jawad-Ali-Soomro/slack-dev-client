import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  PiCalendarBlank,
  PiCheckCircle,
  PiEnvelopeSimple,
  PiLockSimple,
  PiMagnifyingGlass,
  PiShieldCheck,
  PiUser,
  PiUserCircle,
  PiUsers,
  PiXCircle,
} from 'react-icons/pi'
import {
  listCustomersRequest,
  listOrganizationsRequest,
  listUsersRequest,
  updateUserRequest,
} from '@multi-tenants/api'
import { getAssetUrl } from '@multi-tenants/config'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import Input from '../input.jsx'
import Loading from '../loading.jsx'
import { Dropdown } from '../dropdown.jsx'
import ConfirmModal from '../confirm-modal.jsx'
import { FormFieldProvider, SectionTitle } from '../../contexts/form-field-context.jsx'

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'USER', label: 'Customer' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPERADMIN', label: 'Superadmin' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/80',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200/80',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200/80',
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

function roleTone(role) {
  if (role === 'SUPERADMIN') return 'violet'
  if (role === 'ADMIN') return 'sky'
  return 'neutral'
}

function roleLabel(role) {
  if (role === 'SUPERADMIN') return 'Superadmin'
  if (role === 'ADMIN') return 'Admin'
  if (role === 'USER') return 'Customer'
  return role || '—'
}

function statusTone(status) {
  if (status === 'active') return 'emerald'
  if (status === 'suspended') return 'rose'
  return 'neutral'
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function Avatar({ src, name, className = '' }) {
  const initials = (name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  if (src) {
    return (
      <img
        src={getAssetUrl(src)}
        alt=""
        className={cn('size-10 shrink-0 rounded-full object-cover', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600',
        className,
      )}
    >
      {initials || '?'}
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
      <PiUsers className="icon mx-auto size-10 text-zinc-300" />
      <p className="mt-3 text-sm font-medium text-zinc-800">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      ) : null}
    </div>
  )
}

export default function CustomersPage({
  variant = 'admin',
  title = 'Customers',
  description = 'View customers who have booked with your businesses.',
  canManage = false,
}) {
  const isSuperadmin = variant === 'superadmin'

  const [organizations, setOrganizations] = useState([])
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [businessFilter, setBusinessFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [busyId, setBusyId] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const businessOptions = useMemo(
    () => [
      { value: 'all', label: 'All businesses' },
      ...organizations.map((org) => ({
        value: org.id,
        label: org.name,
      })),
    ],
    [organizations],
  )

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      if (isSuperadmin) {
        const users = await listUsersRequest({
          role: roleFilter === 'all' ? undefined : roleFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: debouncedSearch || undefined,
        })
        setRows(Array.isArray(users) ? users : [])
        return
      }

      const orgs = await listOrganizationsRequest()
      const orgList = Array.isArray(orgs) ? orgs : []
      setOrganizations(orgList)

      const customers = await listCustomersRequest({
        orgId: businessFilter === 'all' ? undefined : businessFilter,
        search: debouncedSearch || undefined,
      })
      setRows(Array.isArray(customers) ? customers : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }, [
    businessFilter,
    debouncedSearch,
    isSuperadmin,
    roleFilter,
    statusFilter,
  ])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleUpdate(userId, payload) {
    setBusyId(String(userId))
    setError('')
    try {
      await updateUserRequest(userId, payload)
      setConfirmAction(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setBusyId('')
    }
  }

  const stats = useMemo(() => {
    if (isSuperadmin) {
      return {
        total: rows.length,
        active: rows.filter((row) => row.status === 'active').length,
        suspended: rows.filter((row) => row.status === 'suspended').length,
      }
    }

    return {
      total: rows.length,
      registered: rows.filter((row) => !row.isGuest).length,
      guests: rows.filter((row) => row.isGuest).length,
    }
  }, [isSuperadmin, rows])

  return (
    <FormFieldProvider rounded="rounded-xl">
      <div className="mx-auto w-full space-y-6">
        <SectionTitle
          icon={isSuperadmin ? PiUsers : PiUser}
          title={title}
          description={description}
        />

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Total
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">
              {stats.total}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {isSuperadmin ? 'Active' : 'Registered'}
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">
              {isSuperadmin ? stats.active : stats.registered}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {isSuperadmin ? 'Suspended' : 'Guests'}
            </p>
            <p className="mt-1 text-2xl font-semibold text-rose-700">
              {isSuperadmin ? stats.suspended : stats.guests}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-[400px]">
            <PiMagnifyingGlass className="icon pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                isSuperadmin ? 'Search users...' : 'Search customers...'
              }
              className="h-11 pl-10"
              aria-label={isSuperadmin ? 'Search users' : 'Search customers'}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {!isSuperadmin ? (
              <Dropdown
                value={businessFilter}
                onChange={setBusinessFilter}
                options={businessOptions}
                triggerClassName="h-11 min-w-[220px] justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
              />
            ) : (
              <>
                <Dropdown
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={ROLE_OPTIONS}
                  triggerClassName="h-11 min-w-[160px] justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
                />
                <Dropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={STATUS_OPTIONS}
                  triggerClassName="h-11 min-w-[160px] justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
                />
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white">
            <Loading message={isSuperadmin ? 'Loading users...' : 'Loading customers...'} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={isSuperadmin ? 'No users found' : 'No customers yet'}
            description={
              isSuperadmin
                ? 'Users will appear here once they register on the platform.'
                : 'Customers appear here after they book rooms at your lodging businesses.'
            }
          />
        ) : isSuperadmin ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Bookings</th>
                  {canManage ? (
                    <th className="px-4 py-3 text-right">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isBusy = busyId === String(row.id)
                  const isSuperadminUser = row.role === 'SUPERADMIN'

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={row.avatar?.url}
                            name={row.username}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-900">
                              {row.username}
                            </p>
                            <p className="text-xs text-zinc-500">ID {row.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{row.email}</td>
                      <td className="px-4 py-3">
                        <Badge tone={roleTone(row.role)}>
                          {roleLabel(row.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(row.status)}>
                          {row.status === 'active' ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {row.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <PiCheckCircle className="icon size-4" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500">
                            <PiXCircle className="icon size-4" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-zinc-800">
                        {row.bookingCount ?? 0}
                      </td>
                      {canManage ? (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            {!isSuperadminUser && row.status === 'active' ? (
                              <Button
                                type="button"
                                variant="outlined"
                                className="h-9 gap-1.5 px-3 text-xs"
                                disabled={isBusy}
                                onClick={() =>
                                  setConfirmAction({
                                    userId: row.id,
                                    label: row.username,
                                    action: 'suspend',
                                  })
                                }
                              >
                                <PiLockSimple className="icon size-3.5" />
                                Suspend
                              </Button>
                            ) : null}
                            {!isSuperadminUser && row.status === 'suspended' ? (
                              <Button
                                type="button"
                                variant="outlined"
                                className="h-9 gap-1.5 px-3 text-xs"
                                disabled={isBusy}
                                onClick={() =>
                                  handleUpdate(row.id, { status: 'active' })
                                }
                              >
                                <PiCheckCircle className="icon size-3.5" />
                                Activate
                              </Button>
                            ) : null}
                            {!isSuperadminUser && row.role === 'USER' ? (
                              <Button
                                type="button"
                                variant="outlined"
                                className="h-9 gap-1.5 px-3 text-xs"
                                disabled={isBusy}
                                onClick={() =>
                                  setConfirmAction({
                                    userId: row.id,
                                    label: row.username,
                                    action: 'promote',
                                  })
                                }
                              >
                                <PiShieldCheck className="icon size-3.5" />
                                Make admin
                              </Button>
                            ) : null}
                            {!isSuperadminUser && row.role === 'ADMIN' ? (
                              <Button
                                type="button"
                                variant="outlined"
                                className="h-9 gap-1.5 px-3 text-xs"
                                disabled={isBusy}
                                onClick={() =>
                                  setConfirmAction({
                                    userId: row.id,
                                    label: row.username,
                                    action: 'demote',
                                  })
                                }
                              >
                                <PiUserCircle className="icon size-3.5" />
                                Make customer
                              </Button>
                            ) : null}
                            {!isSuperadminUser && !row.emailVerified ? (
                              <Button
                                type="button"
                                variant="outlined"
                                className="h-9 gap-1.5 px-3 text-xs"
                                disabled={isBusy}
                                onClick={() =>
                                  handleUpdate(row.id, { emailVerified: true })
                                }
                              >
                                <PiEnvelopeSimple className="icon size-3.5" />
                                Verify email
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Businesses</th>
                  <th className="px-4 py-3">Bookings</th>
                  <th className="px-4 py-3">Last booking</th>
                  <th className="px-4 py-3">Type</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const displayName =
                    row.username || row.guestName || row.email

                  return (
                    <tr
                      key={row.id ?? row.email}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={row.avatar?.url}
                            name={displayName}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-900">
                              {displayName}
                            </p>
                            {row.isGuest ? (
                              <p className="text-xs text-zinc-500">Guest booking</p>
                            ) : (
                              <p className="text-xs text-zinc-500">
                                {row.status === 'suspended'
                                  ? 'Suspended account'
                                  : 'Registered user'}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{row.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(row.organizations ?? []).slice(0, 2).map((org) => (
                            <Badge key={org.id} tone="sky">
                              {org.name}
                            </Badge>
                          ))}
                          {(row.organizations?.length ?? 0) > 2 ? (
                            <Badge tone="neutral">
                              +{row.organizations.length - 2}
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {row.bookingCount}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        <span className="inline-flex items-center gap-1.5">
                          <PiCalendarBlank className="icon size-4 text-zinc-400" />
                          {formatDate(row.lastBookingAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.isGuest ? (
                          <Badge tone="amber">Guest</Badge>
                        ) : (
                          <Badge tone={row.emailVerified ? 'emerald' : 'neutral'}>
                            {row.emailVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmModal
          isOpen={Boolean(confirmAction)}
          title={
            confirmAction?.action === 'suspend'
              ? 'Suspend user?'
              : confirmAction?.action === 'promote'
                ? 'Promote to admin?'
                : 'Demote to customer?'
          }
          description={
            confirmAction?.action === 'suspend'
              ? `${confirmAction?.label} will be signed out and unable to log in until reactivated.`
              : confirmAction?.action === 'promote'
                ? `${confirmAction?.label} will receive platform admin privileges.`
                : `${confirmAction?.label} will lose platform admin privileges.`
          }
          confirmLabel={
            confirmAction?.action === 'suspend'
              ? 'Suspend'
              : confirmAction?.action === 'promote'
                ? 'Promote'
                : 'Demote'
          }
          tone={confirmAction?.action === 'suspend' ? 'danger' : 'default'}
          isConfirming={Boolean(busyId)}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (!confirmAction) return

            if (confirmAction.action === 'suspend') {
              handleUpdate(confirmAction.userId, { status: 'suspended' })
              return
            }

            if (confirmAction.action === 'promote') {
              handleUpdate(confirmAction.userId, { role: 'ADMIN' })
              return
            }

            handleUpdate(confirmAction.userId, { role: 'USER' })
          }}
        />
      </div>
    </FormFieldProvider>
  )
}
