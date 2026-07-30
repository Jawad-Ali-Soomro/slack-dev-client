import { BusinessesPage } from '@multi-tenants/ui'

export default function Businesses() {
  return (
    <BusinessesPage
      canManageTeams
      title="My businesses"
      description="Businesses assigned to you. Manage teams and add members."
    />
  )
}
