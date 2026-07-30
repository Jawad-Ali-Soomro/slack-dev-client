import Drawer from '../drawer.jsx'
import BusinessDetailPage from './business-detail-page.jsx'

export default function BusinessDetailDrawer({
  isOpen,
  onClose,
  organizationId,
  canAssignAdmin = false,
  canManageTeams = true,
}) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Business details"
      description="Members, teams, products, and organization info."
      wide
    >
      {organizationId ? (
        <BusinessDetailPage
          key={organizationId}
          organizationId={organizationId}
          canAssignAdmin={canAssignAdmin}
          canManageTeams={canManageTeams}
          embedded
        />
      ) : null}
    </Drawer>
  )
}
