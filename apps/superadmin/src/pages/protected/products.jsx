import { ProductsPage } from '@multi-tenants/ui'

export default function Products() {
  return (
    <ProductsPage
      title="Products"
      description="Products across all businesses. Only business admins can upload."
      canUpload={false}
      canAssignAdmin
      canManageTeams
    />
  )
}
