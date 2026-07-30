import { apiRequest } from './client'

export type OrganizationRole =
  | 'OWNER'
  | 'ADMIN'
  | 'MANAGER'
  | 'MEMBER'
  | 'GUEST'

export type TeamRole = 'LEAD' | 'MEMBER'

export type OrgMember = {
  id: string
  role: OrganizationRole
  joinedAt?: string
  user: {
    id: number
    username: string
    email: string
    role?: string
  }
}

export type TeamMember = {
  id: string
  role: TeamRole
  user: {
    id: number
    username: string
    email: string
  }
}

export type Team = {
  id: string
  name: string
  slug: string
  description?: string | null
  organizationId: string
  members?: TeamMember[]
  _count?: { members: number }
}

export type Organization = {
  id: string
  name: string
  slug: string
  description?: string | null
  website?: string | null
  businessType?: string | null
  city?: string | null
  country?: string | null
  address?: string | null
  isActive?: boolean
  isVerified?: boolean
  ownerId?: number
  owner?: {
    id: number
    username: string
    email: string
    role?: string
  } | null
  logo?: { id: string; url: string } | null
  myRole?: OrganizationRole
  members?: OrgMember[]
  teams?: Team[]
  _count?: { members: number; teams: number }
  createdAt?: string
}

export type CreateOrganizationPayload = {
  name: string
  slug: string
  description?: string
  website?: string
  businessType: string
  city?: string
  country?: string
  address?: string
  adminEmail?: string
}

export type AddMemberPayload = {
  email?: string
  userId?: number
  role?: OrganizationRole
}

export type CreateTeamPayload = {
  name: string
  slug: string
  description?: string
}

export type AddTeamMemberPayload = {
  email?: string
  userId?: number
  role?: TeamRole
}

export async function listOrganizationsRequest() {
  return apiRequest<Organization[]>('/org')
}

export async function getOrganizationRequest(id: string) {
  return apiRequest<Organization>(`/org/${id}`)
}

export async function createOrganizationRequest(
  payload: CreateOrganizationPayload,
) {
  return apiRequest<Organization>('/org', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateOrganizationRequest(
  id: string,
  payload: Partial<CreateOrganizationPayload>,
) {
  return apiRequest<Organization>(`/org/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteOrganizationRequest(id: string) {
  return apiRequest<{ message: string }>(`/org/${id}`, {
    method: 'DELETE',
  })
}

export async function assignOrganizationAdminRequest(
  orgId: string,
  email: string,
) {
  return apiRequest<Organization>(`/org/${orgId}/assign-admin`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function listMembersRequest(orgId: string) {
  return apiRequest<OrgMember[]>(`/org/${orgId}/members`)
}

export async function addMemberRequest(
  orgId: string,
  payload: AddMemberPayload,
) {
  return apiRequest<OrgMember>(`/org/${orgId}/members`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateMemberRequest(
  orgId: string,
  memberId: string,
  role: OrganizationRole,
) {
  return apiRequest<OrgMember>(`/org/${orgId}/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

export async function removeMemberRequest(orgId: string, memberId: string) {
  return apiRequest<{ message: string }>(`/org/${orgId}/members/${memberId}`, {
    method: 'DELETE',
  })
}

export async function listTeamsRequest(orgId: string) {
  return apiRequest<Team[]>(`/organizations/${orgId}/teams`)
}

export async function createTeamRequest(
  orgId: string,
  payload: CreateTeamPayload,
) {
  return apiRequest<Team>(`/organizations/${orgId}/teams`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteTeamRequest(orgId: string, teamId: string) {
  return apiRequest<{ message: string }>(
    `/organizations/${orgId}/teams/${teamId}`,
    { method: 'DELETE' },
  )
}

export async function addTeamMemberRequest(
  orgId: string,
  teamId: string,
  payload: AddTeamMemberPayload,
) {
  return apiRequest<TeamMember>(
    `/organizations/${orgId}/teams/${teamId}/members`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export async function updateTeamMemberRequest(
  orgId: string,
  teamId: string,
  memberId: string,
  role: TeamRole,
) {
  return apiRequest<TeamMember>(
    `/organizations/${orgId}/teams/${teamId}/members/${memberId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    },
  )
}

export async function removeTeamMemberRequest(
  orgId: string,
  teamId: string,
  memberId: string,
) {
  return apiRequest<{ message: string }>(
    `/organizations/${orgId}/teams/${teamId}/members/${memberId}`,
    { method: 'DELETE' },
  )
}

export async function uploadOrganizationLogoRequest(
  orgId: string,
  file: File,
) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<{
    message: string
    image: { id: string; url: string }
  }>(`/upload/organizations/${orgId}/logo`, {
    method: 'POST',
    body: formData,
  })
}
