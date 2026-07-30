import { InventoryPage } from '@multi-tenants/ui'

export default function Inventory() {
  return (
    <InventoryPage
      title="Inventory"
      description="Manage stock quantities for your products. Create a product first, then add one inventory record per product."
      canManage
    />
  )
}
