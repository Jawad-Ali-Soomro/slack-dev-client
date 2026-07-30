import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  PiBuildings,
  PiCrownSimple,
  PiPackage,
  PiPencilSimple,
  PiPlus,
  PiShieldCheck,
  PiStar,
  PiTrash,
  PiUser,
  PiUserCheck,
  PiUserPlus,
  PiUsers,
  PiUsersThree,
} from 'react-icons/pi'
import {
  getOrganizationRequest,
  listProductsRequest,
  removeMemberRequest,
  removeTeamMemberRequest,
  updateMemberRequest,
  updateTeamMemberRequest,
} from '@multi-tenants/api'
import { formatBusinessTypeLabel, isLodgingBusinessType } from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import { cn, formatRoleLabel } from '@multi-tenants/utils'
import Accordion from '../accordion.jsx'
import ConfirmModal from '../confirm-modal.jsx'
import Loading from '../loading.jsx'
import { FormFieldProvider } from '../../contexts/form-field-context.jsx'
import AddMemberModal from './add-member-modal.jsx'
import AddTeamMemberModal from './add-team-member-modal.jsx'
import CreateTeamModal from './create-team-modal.jsx'
import EditMemberRoleModal from './edit-member-role-modal.jsx'

const FALLBACK_AVATAR = '/avatar.webp'

function getUserAvatarSrc(user) {
  if (user?.avatar?.url) {
    return getAssetUrl(user.avatar.url)
  }
  return FALLBACK_AVATAR
}

function UserAvatar({ user, className = '' }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200/70',
        className,
      )}
    >
      <img
        src={getUserAvatarSrc(user)}
        alt=""
        className="icon h-full w-full object-cover"
      />
    </div>
  )
}

function IconActionButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
  tone = 'neutral',
  className = '',
}) {
  const tones = {
    neutral: 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
    primary: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
    danger: 'border-rose-200 text-rose-600 hover:bg-rose-50',
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-xl border bg-white transition disabled:opacity-50',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      <Icon className="icon size-4" />
    </button>
  )
}

function getRoleBadgeMeta(role) {
  switch (role) {
    case 'OWNER':
      return {
        icon: PiCrownSimple,
        className: 'bg-amber-50 text-amber-800 ring-amber-200/80',
        iconClassName: 'text-amber-600',
      }
    case 'ADMIN':
      return {
        icon: PiShieldCheck,
        className: 'bg-violet-50 text-violet-800 ring-violet-200/80',
        iconClassName: 'text-violet-600',
      }
    case 'MANAGER':
      return {
        icon: PiUserCheck,
        className: 'bg-sky-50 text-sky-800 ring-sky-200/80',
        iconClassName: 'text-sky-600',
      }
    case 'LEAD':
      return {
        icon: PiStar,
        className: 'bg-orange-50 text-orange-800 ring-orange-200/80',
        iconClassName: 'text-orange-600',
      }
    case 'GUEST':
      return {
        icon: PiUser,
        className: 'bg-zinc-100 text-zinc-600 ring-zinc-200/80',
        iconClassName: 'text-zinc-500',
      }
    case 'MEMBER':
    default:
      return {
        icon: PiUsers,
        className: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
        iconClassName: 'text-emerald-600',
      }
  }
}

function RoleBadge({ role }) {
  const meta = getRoleBadgeMeta(role)
  const Icon = meta.icon

  return (
    <span
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold tracking-wide ring-1 ring-inset',
        meta.className,
      )}
    >
      <Icon className={cn('icon', 'size-3.5 shrink-0', meta.iconClassName)} />
      {formatRoleLabel(role)}
    </span>
  )
}

function formatPrice(price) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0)
}

export default function BusinessDetailPage({
  organizationId: organizationIdProp,
  canAssignAdmin = false,
  canManageTeams = true,
  embedded = false,
}) {
  const params = useParams()
  const id = organizationIdProp ?? params?.id
  const [organization, setOrganization] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false)
  const [teamForMember, setTeamForMember] = useState(null)

  const [isRoleEditOpen, setIsRoleEditOpen] = useState(false)
  const [roleEdit, setRoleEdit] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmState, setConfirmState] = useState(null)

  const loadOrganization = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError('')
    try {
      const orgData = await getOrganizationRequest(id)
      setOrganization(orgData)

      if (isLodgingBusinessType(orgData?.businessType)) {
        setProducts([])
      } else {
        const productData = await listProductsRequest(id).catch(() => [])
        setProducts(Array.isArray(productData) ? productData : [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load business')
      setOrganization(null)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadOrganization()
  }, [loadOrganization])

  async function handleSaveRole(role) {
    if (!id || !roleEdit) return

    if (roleEdit.scope === 'organization') {
      await updateMemberRequest(id, roleEdit.member.id, role)
    } else {
      await updateTeamMemberRequest(
        id,
        roleEdit.teamId,
        roleEdit.member.id,
        role,
      )
    }
    await loadOrganization()
  }

  async function handleConfirmDelete() {
    if (!id || !confirmState) return

    setBusy('confirm')
    setError('')
    try {
      if (confirmState.type === 'member') {
        await removeMemberRequest(id, confirmState.memberId)
      } else if (confirmState.type === 'team-member') {
        await removeTeamMemberRequest(
          id,
          confirmState.teamId,
          confirmState.memberId,
        )
      }
      setIsConfirmOpen(false)
      await loadOrganization()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove')
    } finally {
      setBusy('')
    }
  }

  if (isLoading) {
    return <Loading message="Loading business..." />
  }

  if (!organization) {
    return (
      <div className="space-y-4">
        {!embedded ? (
          <Link to="/businesses" className="text-sm text-gray-500 hover:text-gray-800">
            ← Back to businesses
          </Link>
        ) : null}
        <p className="text-red-600">{error || 'Business not found'}</p>
      </div>
    )
  }

  const members = organization.members ?? []
  const teams = organization.teams ?? []
  const isLodging = isLodgingBusinessType(organization.businessType)
  const locationLabel = [organization.city, organization.country]
    .filter(Boolean)
    .join(', ')

  return (
    <FormFieldProvider rounded="rounded-xl">
      <div className={cn('mx-auto w-full', embedded ? 'space-y-4' : 'space-y-8')}>
        <div>
          {!embedded ? (
            <Link
              to="/businesses"
              className="text-sm text-gray-500 transition hover:text-gray-800"
            >
              ← Back to businesses
            </Link>
          ) : null}
          <div className={cn('flex items-center gap-3', !embedded && 'mt-3')}>
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-gray-100 ring-1 ring-zinc-200/80">
              {organization.logo?.url ? (
                <img
                  src={getAssetUrl(organization.logo.url)}
                  alt=""
                  className="icon h-full w-full object-cover"
                />
              ) : (
                <img
                  src={FALLBACK_AVATAR}
                  alt=""
                  className="icon h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-center leading-tight">
              <h1 className="truncate text-base font-bold text-gray-900">
                {organization.name}
              </h1>
              <p className="truncate text-xs text-gray-500">
                {organization.slug}
                {organization.businessType
                  ? ` · ${formatBusinessTypeLabel(organization.businessType)}`
                  : ''}
              </p>
              {locationLabel ? (
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {locationLabel}
                  {organization.address ? ` · ${organization.address}` : ''}
                </p>
              ) : null}
              {organization.description ? (
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                  {organization.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {error ? (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="space-y-3">
          <Accordion
            icon={PiUsers}
            title="Members"
            count={members.length}
            defaultOpen
            description={
              canAssignAdmin
                ? 'People in this organization and their roles.'
                : 'People in this organization.'
            }
            actions={
              <IconActionButton
                label="Add member"
                icon={PiPlus}
                tone="primary"
                onClick={() => setIsAddMemberOpen(true)}
              />
            }
          >
            {members.length === 0 ? (
              <p className="text-sm text-zinc-500">No members yet.</p>
            ) : (
              <ul className="space-y-2">
                {members.map((member, index) => (
                  <li
                    key={member.id}
                    className="detail-list-row flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-gradient-to-r from-white to-zinc-50/80 px-3 py-3"
                    style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar user={member.user} className="size-10" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {member.user.username}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <RoleBadge role={member.role} />
                      {canAssignAdmin && member.role !== 'OWNER' ? (
                        <IconActionButton
                          label="Edit role"
                          icon={PiPencilSimple}
                          onClick={() => {
                            setRoleEdit({
                              scope: 'organization',
                              member,
                              contextLabel: organization.name,
                            })
                            setIsRoleEditOpen(true)
                          }}
                        />
                      ) : null}
                      {member.role !== 'OWNER' ? (
                        <IconActionButton
                          label="Remove member"
                          icon={PiTrash}
                          tone="danger"
                          onClick={() => {
                            setConfirmState({
                              type: 'member',
                              memberId: member.id,
                              title: 'Remove member?',
                              description: `Remove ${member.user.username} from this organization?`,
                            })
                            setIsConfirmOpen(true)
                          }}
                        />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Accordion>

          {canManageTeams ? (
            <Accordion
              icon={PiUsersThree}
              title="Teams"
              count={teams.length}
              description="Expand a team to view and manage its members."
              actions={
                <IconActionButton
                  label="Create team"
                  icon={PiPlus}
                  tone="primary"
                  onClick={() => setIsCreateTeamOpen(true)}
                />
              }
            >
              {teams.length === 0 ? (
                <p className="text-sm text-zinc-500">No teams yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {teams.map((team, teamIndex) => (
                    <div
                      key={team.id}
                      className="detail-list-row"
                      style={{
                        animationDelay: `${Math.min(teamIndex, 8) * 40}ms`,
                      }}
                    >
                      <Accordion
                        variant="nested"
                        icon={PiUsersThree}
                        title={team.name}
                        count={team.members?.length ?? team._count?.members ?? 0}
                        description={team.slug}
                        actions={
                          <IconActionButton
                            label={`Add member to ${team.name}`}
                            icon={PiUserPlus}
                            tone="primary"
                            onClick={() => {
                              setTeamForMember(team)
                              setIsAddTeamMemberOpen(true)
                            }}
                          />
                        }
                      >
                        {(team.members ?? []).length === 0 ? (
                          <p className="text-sm text-zinc-500">
                            No team members yet.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {(team.members ?? []).map((member, index) => (
                              <li
                                key={member.id}
                                className="detail-list-row flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white px-3 py-2.5"
                                style={{
                                  animationDelay: `${Math.min(index, 8) * 35}ms`,
                                }}
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <UserAvatar
                                    user={member.user}
                                    className="size-9"
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-zinc-900">
                                      {member.user.username}
                                    </p>
                                    <p className="truncate text-xs text-zinc-500">
                                      {member.user.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <RoleBadge role={member.role} />
                                  <IconActionButton
                                    label="Edit team role"
                                    icon={PiPencilSimple}
                                    onClick={() => {
                                      setRoleEdit({
                                        scope: 'team',
                                        member,
                                        teamId: team.id,
                                        contextLabel: team.name,
                                      })
                                      setIsRoleEditOpen(true)
                                    }}
                                  />
                                  <IconActionButton
                                    label="Remove from team"
                                    icon={PiTrash}
                                    tone="danger"
                                    onClick={() => {
                                      setConfirmState({
                                        type: 'team-member',
                                        teamId: team.id,
                                        memberId: member.id,
                                        title: 'Remove from team?',
                                        description: `Remove ${member.user.username} from ${team.name}?`,
                                      })
                                      setIsConfirmOpen(true)
                                    }}
                                  />
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Accordion>
                    </div>
                  ))}
                </div>
              )}
            </Accordion>
          ) : null}

          {isLodging ? (
            <Accordion
              icon={PiBuildings}
              title="Rooms"
              description="Hotels and hostels use floors and rooms instead of products."
            >
              <p className="text-sm text-zinc-500">
                Property location is set by the superadmin. Manage floors, rooms,
                and bookings from{' '}
                <Link
                  to="/hotel-rooms"
                  className="font-medium text-primary hover:underline"
                >
                  Hotel rooms
                </Link>
                .
              </p>
            </Accordion>
          ) : (
            <Accordion
              icon={PiPackage}
              title="Products"
              count={products.length}
              description="Products belonging to this business."
            >
              {products.length === 0 ? (
                <p className="text-sm text-zinc-500">No products yet.</p>
              ) : (
                <ul className="space-y-2">
                  {products.map((product, index) => {
                    const cover = product.images?.[0]
                    return (
                      <li
                        key={product.id}
                        className="detail-list-row flex items-center gap-3 rounded-2xl border border-zinc-100 bg-gradient-to-r from-white to-zinc-50/80 px-3 py-2.5"
                        style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                      >
                        <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                          {cover?.url ? (
                            <img
                              src={getAssetUrl(cover.url)}
                              alt=""
                              className="icon h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-zinc-400">
                              <PiPackage className="icon size-5" />
                            </div>
                          )}
                        </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {product.name}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {product.category?.name
                            ? `${product.category.name} · `
                            : ''}
                          SKU · {product.sku}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-emerald-600">
                        {formatPrice(product.price)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </Accordion>
          )}
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddMemberOpen}
        organizationId={id}
        canAssignAdmin={canAssignAdmin}
        onClose={() => setIsAddMemberOpen(false)}
        onAdded={() => void loadOrganization()}
      />

      <EditMemberRoleModal
        isOpen={isRoleEditOpen}
        member={roleEdit?.member ?? null}
        scope={roleEdit?.scope ?? 'organization'}
        contextLabel={roleEdit?.contextLabel ?? ''}
        onClose={() => setIsRoleEditOpen(false)}
        onSaved={handleSaveRole}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={confirmState?.title}
        description={confirmState?.description}
        confirmLabel="Remove"
        isConfirming={busy === 'confirm'}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => void handleConfirmDelete()}
      />

      {canManageTeams ? (
        <>
          <CreateTeamModal
            isOpen={isCreateTeamOpen}
            organizationId={id}
            onClose={() => setIsCreateTeamOpen(false)}
            onCreated={() => void loadOrganization()}
          />
          <AddTeamMemberModal
            isOpen={isAddTeamMemberOpen}
            organizationId={id}
            team={teamForMember}
            onClose={() => setIsAddTeamMemberOpen(false)}
            onAdded={() => void loadOrganization()}
          />
        </>
      ) : null}
    </FormFieldProvider>
  )
}
