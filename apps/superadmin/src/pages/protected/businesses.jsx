import { BusinessesPage } from '@multi-tenants/ui'

export default function Businesses() {
  return (
    <BusinessesPage
      canCreate
      canEdit
      canDelete
      canAssignAdmin
      canManageTeams
      title="Businesses"
      description="Create organizations, assign admins, and hand them off to manage day-to-day."
    />
  )
}
