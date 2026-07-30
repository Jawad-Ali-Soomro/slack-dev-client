import { InventoryPage } from '@multi-tenants/ui'

export default function Inventory() {
  return (
    <InventoryPage
      title="Inventory"
      description="View and manage inventory across all organizations. Each product can have only one inventory record."
      canManage
    />
  )
}
