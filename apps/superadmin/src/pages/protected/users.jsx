import { CustomersPage } from '@multi-tenants/ui'

export default function Users() {
  return (
    <CustomersPage
      variant="superadmin"
      title="Users"
      description="Manage all platform users — update roles, suspend accounts, and verify emails."
      canManage
    />
  )
}
