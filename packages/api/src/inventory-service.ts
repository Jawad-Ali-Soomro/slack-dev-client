import { apiRequest } from './client'
import type { Product, ProductImage } from './product-service'

export type Inventory = {
  id: string
  quantity: number
  reservedQty: number
  reorderLevel?: number | null
  available: number
  inStock: boolean
  productId: string
  organizationId: string
  createdAt?: string
  updatedAt?: string
  product?: {
    id: string
    name: string
    sku: string
    status?: string
    price: number
    images?: ProductImage[]
  }
}

export type CreateInventoryPayload = {
  productId: string
  quantity: number
  reorderLevel?: number
}

export type UpdateInventoryPayload = {
  quantity?: number
  reservedQty?: number
  reorderLevel?: number | null
}

export async function listInventoryRequest(orgId: string) {
  return apiRequest<Inventory[]>(`/organizations/${orgId}/inventory`)
}

export async function createInventoryRequest(
  orgId: string,
  payload: CreateInventoryPayload,
) {
  return apiRequest<Inventory>(`/organizations/${orgId}/inventory`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateInventoryRequest(
  orgId: string,
  inventoryId: string,
  payload: UpdateInventoryPayload,
) {
  return apiRequest<Inventory>(
    `/organizations/${orgId}/inventory/${inventoryId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
}

export async function deleteInventoryRequest(
  orgId: string,
  inventoryId: string,
) {
  return apiRequest<{ message: string }>(
    `/organizations/${orgId}/inventory/${inventoryId}`,
    { method: 'DELETE' },
  )
}

// Re-export Product type helper for stock fields used on public listings
export type ProductStock = Pick<
  Product,
  'inventory' | 'inStock' | 'availableQuantity'
>
