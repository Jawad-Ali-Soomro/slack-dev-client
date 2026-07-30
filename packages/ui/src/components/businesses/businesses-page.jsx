import { useEffect, useMemo, useState } from 'react'
import {
  PiBuildings,
  PiEye,
  PiEyeDuotone,
  PiGear,
  PiMagnifyingGlass,
  PiPencilDuotone,
  PiPencilSimple,
  PiTrash,
  PiTrashDuotone,
  PiUserPlus,
  PiUserPlusDuotone,
  PiUsers,
  PiUsersThree,
  PiX,
} from 'react-icons/pi'
import {
  deleteOrganizationRequest,
  listOrganizationsRequest,
} from '@multi-tenants/api'
import { BUSINESS_TYPE_OPTIONS, formatBusinessTypeLabel } from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import Checkbox from '../checkbox.jsx'
import Input from '../input.jsx'
import Loading from '../loading.jsx'
import { Dropdown } from '../dropdown.jsx'
import AssignAdminModal from './assign-admin-modal.jsx'
import BusinessDetailDrawer from './business-detail-drawer.jsx'
import CreateBusinessModal from './create-business-modal.jsx'

const FILTER_BUSINESS_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...BUSINESS_TYPE_OPTIONS,
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'Unassigned' },
]

function getLogoSrc(organization) {
  if (!organization?.logo?.url) {
    return null
  }

  return getAssetUrl(organization.logo.url)
}

function getAssignedAdmin(organization) {
  if (organization.owner && organization.owner.role !== 'SUPERADMIN') {
    return organization.owner
  }

  const adminMember = (organization.members ?? []).find(
    (member) => member.role === 'OWNER' || member.role === 'ADMIN',
  )

  return adminMember?.user ?? organization.owner ?? null
}

function isAssigned(organization) {
  const admin = getAssignedAdmin(organization)
  return Boolean(admin && admin.role !== 'SUPERADMIN')
}

function Badge({ children, tone = 'neutral', className = '', dot = false }) {
  const tones = {
    neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200/70',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200/70',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200/70',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/70',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200/80',
  }

  const dots = {
    neutral: 'bg-zinc-400',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium ring-1 ring-inset',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {dot ? (
        <span
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            dots[tone] ?? dots.neutral,
          )}
        />
      ) : null}
      <span className="truncate">{children}</span>
    </span>
  )
}

function businessTypeTone(type) {
  switch (type) {
    case 'e-commerce':
      return 'sky'
    case 'hostel-management':
      return 'violet'
    case 'hotel-management':
      return 'emerald'
    case 'pharmacy':
      return 'rose'
    default:
      return 'slate'
  }
}

export default function BusinessesPage({
  canCreate = false,
  canAssignAdmin = false,
  canEdit = false,
  canDelete = false,
  canManageTeams = true,
  title = 'Businesses',
  description = 'Manage businesses and their teams.',
}) {
  const [organizations, setOrganizations] = useState([])
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [assigningOrg, setAssigningOrg] = useState(null)
  const [detailOrgId, setDetailOrgId] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  async function loadOrganizations() {
    setIsLoading(true)
    setError('')
    try {
      const data = await listOrganizationsRequest()
      setOrganizations(Array.isArray(data) ? data : [])
      setSelectedIds(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load businesses')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrganizations()
  }, [])

  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return organizations.filter((org) => {
      const admin = getAssignedAdmin(org)
      const assigned = isAssigned(org)

      if (typeFilter !== 'all' && org.businessType !== typeFilter) {
        return false
      }

      if (statusFilter === 'assigned' && !assigned) {
        return false
      }

      if (statusFilter === 'unassigned' && assigned) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = [
        org.name,
        org.slug,
        org.businessType,
        org.city,
        org.country,
        org.address,
        admin?.username,
        admin?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [organizations, search, typeFilter, statusFilter])

  const allSelected = useMemo(
    () =>
      filteredOrganizations.length > 0 &&
      filteredOrganizations.every((org) => selectedIds.has(org.id)),
    [filteredOrganizations, selectedIds],
  )

  const someSelected = useMemo(
    () => filteredOrganizations.some((org) => selectedIds.has(org.id)),
    [filteredOrganizations, selectedIds],
  )

  const hasActiveFilters =
    search.trim() !== '' || typeFilter !== 'all' || statusFilter !== 'all'

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(filteredOrganizations.map((org) => org.id)))
  }

  function toggleOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function clearFilters() {
    setSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  async function handleDelete(org) {
    const confirmed = window.confirm(
      `Delete "${org.name}"? This cannot be undone.`,
    )
    if (!confirmed) return

    setBusy(`delete-${org.id}`)
    setError('')
    try {
      await deleteOrganizationRequest(org.id)
      await loadOrganizations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete business')
    } finally {
      setBusy('')
    }
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds]
    if (ids.length === 0) return

    const confirmed = window.confirm(
      `Delete ${ids.length} selected business${ids.length === 1 ? '' : 'es'}? This cannot be undone.`,
    )
    if (!confirmed) return

    setBusy('bulk-delete')
    setError('')
    try {
      for (const id of ids) {
        await deleteOrganizationRequest(id)
      }
      await loadOrganizations()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete selected businesses',
      )
    } finally {
      setBusy('')
    }
  }

  if (isLoading) {
    return <Loading message="Loading businesses..." />
  }

  const iconBtnClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-50'

  return (
    <div className="mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">{description}</p>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <PiMagnifyingGlass className="icon pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search businesses, admin, email..."
            className="h-11 rounded-xl pl-11 pr-10"
            aria-label="Search businesses"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            >
              <PiX className="icon size-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-[11.5rem]">
            <Dropdown
              value={typeFilter}
              onChange={setTypeFilter}
              options={FILTER_BUSINESS_TYPE_OPTIONS}
              triggerClassName="h-11 px-3 text-sm"
            />
          </div>

          <div className="w-[10.5rem]">
            <Dropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              triggerClassName="h-11 px-3 text-sm"
            />
          </div>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outlined"
              onClick={clearFilters}
              className="h-11 px-3 text-zinc-600"
            >
              Clear
            </Button>
          ) : null}

          {canDelete && someSelected ? (
            <Button
              type="button"
              variant="outlined"
              disabled={busy === 'bulk-delete'}
              onClick={() => void handleBulkDelete()}
              className="h-11 border-rose-200 px-4 text-rose-600 hover:bg-rose-50"
            >
              {busy === 'bulk-delete'
                ? 'Deleting...'
                : `Delete (${selectedIds.size})`}
            </Button>
          ) : null}

          {canCreate ? (
            <Button
              type="button"
              onClick={() => {
                setEditingOrg(null)
                setIsCreateOpen(true)
              }}
              className="h-11 px-5"
            >
              Create business
            </Button>
          ) : null}
        </div>
      </div>

      {organizations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <PiBuildings className="icon size-6" />
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-900">
            No businesses yet
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {canCreate
              ? 'Create one and assign an admin to manage it.'
              : 'Assigned businesses will appear here.'}
          </p>
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-zinc-900">No matches found</p>
          <p className="mt-1 text-sm text-zinc-500">
            Try another search or clear your filters.
          </p>
          <Button
            type="button"
            variant="outlined"
            onClick={clearFilters}
            className="mt-4 h-10 px-4"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90">
                  <th className="w-12 px-4 py-3.5">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected && !allSelected}
                      onChange={toggleAll}
                      ariaLabel="Select all businesses"
                    />
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Business
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Type
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Admin profile
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Admin email
                  </th>
                 
                  <th className="w-[1%] px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrganizations.map((org) => {
                  const logoSrc = getLogoSrc(org)
                  const isSelected = selectedIds.has(org.id)
                  const members =
                    org._count?.members ?? org.members?.length ?? 0
                  const teams = org._count?.teams ?? org.teams?.length ?? 0
                  const admin = getAssignedAdmin(org)
                  const unassigned = !isAssigned(org)

                  return (
                    <tr
                      key={org.id}
                      className={cn(
                        'group transition-colors',
                        isSelected ? 'bg-emerald-50/50' : 'hover:bg-zinc-50/80',
                      )}
                    >
                      <td className="px-4 py-4 align-middle">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleOne(org.id)}
                          ariaLabel={`Select ${org.name}`}
                        />
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-500 ring-1 ring-zinc-200/80">
                            {logoSrc ? (
                              <img
                                src={logoSrc}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              org.name.slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-zinc-900">
                              {org.name}
                            </p>
                            <p className="mt-0.5 truncate font-mono text-xs text-zinc-400">
                              {org.slug}
                              {org.city || org.country
                                ? ` · ${[org.city, org.country].filter(Boolean).join(', ')}`
                                : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        {org.businessType ? (
                          <Badge className='uppercase' tone={businessTypeTone(org.businessType)}>
                            {formatBusinessTypeLabel(org.businessType)}
                          </Badge>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        {unassigned ? (
                          <Badge tone="amber" dot>
                            Unassigned
                          </Badge>
                        ) : (
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                              {
                                admin.avatar ? (
                                  <img src={admin.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <img src="/avatar.webp" alt="" className="h-full w-full object-cover rounded-full" />
                                )
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-900">
                                {admin.username}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        {unassigned ? (
                          <span className="text-zinc-400">—</span>
                        ) : (
                          <p className="truncate text-sm text-zinc-600">
                            {admin.email}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="inline-flex items-center justify-end gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            title="Details"
                            aria-label={`View details for ${org.name}`}
                            className={iconBtnClass}
                            onClick={() => {
                              setDetailOrgId(org.id)
                              setIsDetailOpen(true)
                            }}
                          >
                            <PiEyeDuotone className="icon size-4" />
                          </button>

                          {canEdit ? (
                            <button
                              type="button"
                              title="Edit"
                              aria-label={`Edit ${org.name}`}
                              className={iconBtnClass}
                              onClick={() => {
                                setEditingOrg(org)
                                setIsCreateOpen(true)
                              }}
                            >
                              <PiPencilDuotone className="icon size-4" />
                            </button>
                          ) : null}

                          {canAssignAdmin ? (
                            <button
                              type="button"
                              title="Assign admin"
                              aria-label={`Assign admin for ${org.name}`}
                              className={iconBtnClass}
                              onClick={() => setAssigningOrg(org)}
                            >
                              <PiUserPlusDuotone className="icon size-4" />
                            </button>
                          ) : null}

                          {canDelete ? (
                            <button
                              type="button"
                              title="Delete"
                              aria-label={`Delete ${org.name}`}
                              disabled={busy === `delete-${org.id}`}
                              className={cn(
                                iconBtnClass,
                                'hover:bg-rose-50 hover:text-rose-600',
                              )}
                              onClick={() => void handleDelete(org)}
                            >
                              <PiTrashDuotone className="icon size-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {canCreate || canEdit ? (
        <CreateBusinessModal
          isOpen={isCreateOpen}
          organization={editingOrg}
          canAssignAdmin={canAssignAdmin && !editingOrg}
          onClose={() => {
            setIsCreateOpen(false)
            setEditingOrg(null)
          }}
          onSaved={() => void loadOrganizations()}
        />
      ) : null}

      {canAssignAdmin ? (
        <AssignAdminModal
          isOpen={Boolean(assigningOrg)}
          organization={assigningOrg}
          onClose={() => setAssigningOrg(null)}
          onAssigned={() => void loadOrganizations()}
        />
      ) : null}

      <BusinessDetailDrawer
        isOpen={isDetailOpen}
        organizationId={detailOrgId}
        canAssignAdmin={canAssignAdmin}
        canManageTeams={canManageTeams}
        onClose={() => {
          setIsDetailOpen(false)
          void loadOrganizations()
        }}
      />
    </div>
  )
}
