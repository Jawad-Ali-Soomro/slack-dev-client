import { apiRequest } from './client'
import { getApiUrl } from '@multi-tenants/config'
import { getAccessToken } from '@multi-tenants/utils'

export type OrderItem = {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  unitPriceCents?: number
  lineTotal: number
}

export type ShopOrder = {
  id: string
  status: string
  totalPrice: number
  totalPriceCents?: number
  createdAt: string
  updatedAt: string
  organizationId: string
  organizationName: string
  organizationSlug?: string
  items: OrderItem[]
}

export type CreateOrderPayload = {
  items: Array<{ productId: string; quantity: number }>
}

export function createOrderRequest(payload: CreateOrderPayload) {
  return apiRequest<ShopOrder[]>('/catalog/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function listMyOrdersRequest() {
  return apiRequest<ShopOrder[]>('/catalog/my-orders')
}

export async function uploadAvatarRequest(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const headers: Record<string, string> = {}
  const accessToken = getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(getApiUrl('/upload/avatar'), {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = (await response.json().catch(() => null)) as {
    message?: string | string[]
    error?: string
  } | null

  if (!response.ok) {
    const message = data?.message ?? data?.error ?? 'Upload failed'
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message))
  }

  return data
}
