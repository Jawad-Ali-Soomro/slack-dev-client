import { ProductsPage } from '@multi-tenants/ui'

export default function Products() {
  return (
    <ProductsPage
      title="Products"
      description="Upload and manage products for your businesses."
      canUpload
      canManageTeams
    />
  )
}
