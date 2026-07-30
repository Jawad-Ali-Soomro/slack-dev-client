import { apiRequest } from './client'
import type { PaginatedResult } from './pagination'

export type ProductImage = {
  id: string
  url: string
  alt?: string | null
}

export type ProductCategory = {
  id: string
  name: string
  slug: string
  _count?: { products: number }
}

export type Product = {
  id: string
  name: string
  description?: string | null
  sku: string
  price: number
  priceCents?: number
  isActive?: boolean
  isFeatured?: boolean
  status?: 'draft' | 'published' | 'deleted'
  organizationId: string
  categoryId?: string | null
  category?: ProductCategory | null
  teamId?: string | null
  attributes?: ProductAttributes | null
  images?: ProductImage[]
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  inventory?: {
    id: string
    quantity: number
    reservedQty: number
    reorderLevel?: number | null
    available: number
    inStock: boolean
  } | null
  inStock?: boolean
  availableQuantity?: number
}

export type ProductAttributes = {
  climate?: 'ac' | 'non-ac'
  bathroom?: 'private' | 'shared'
  mealPlan?: 'none' | 'breakfast' | 'half-board' | 'full-board'
  view?: 'city' | 'garden' | 'pool' | 'mountain' | 'none'
  stayDays?: number
  maxGuests?: number
  bedCount?: number
  city?: string
  area?: string
  country?: string
  address?: string
  notes?: string
}

export type CreateProductPayload = {
  name: string
  description?: string
  category: string
  price: number
  sku?: string
  isFeatured?: boolean
  status?: 'draft' | 'published' | 'deleted'
  attributes?: ProductAttributes
}

export type PublicProduct = Product & {
  organizationName?: string
  organizationSlug?: string
  businessType?: string | null
}

export type CatalogProductsQuery = {
  businessType?: string
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'name'
  featured?: boolean
  page?: number
  limit?: number
}

export type CatalogProductFilters = {
  categories: Array<{ name: string; slug: string }>
  businessTypes: string[]
  price: { min: number; max: number }
  sortOptions: string[]
}

export type UpdateProductPayload = Partial<CreateProductPayload>

export async function listPublicProductsRequest(options?: CatalogProductsQuery) {
  const params = new URLSearchParams()
  if (options?.businessType) params.set('businessType', options.businessType)
  if (options?.q) params.set('q', options.q)
  if (options?.category) params.set('category', options.category)
  if (options?.minPrice != null) params.set('minPrice', String(options.minPrice))
  if (options?.maxPrice != null) params.set('maxPrice', String(options.maxPrice))
  if (options?.sort) params.set('sort', options.sort)
  if (options?.featured === true) params.set('featured', 'true')
  if (options?.page != null) params.set('page', String(options.page))
  if (options?.limit != null) params.set('limit', String(options.limit))
  const query = params.toString()
  return apiRequest<PaginatedResult<PublicProduct>>(
    `/catalog/products${query ? `?${query}` : ''}`,
  )
}

export async function getPublicCatalogFiltersRequest(businessType?: string) {
  const params = new URLSearchParams()
  if (businessType) params.set('businessType', businessType)
  const query = params.toString()
  return apiRequest<CatalogProductFilters>(
    `/catalog/products/filters${query ? `?${query}` : ''}`,
  )
}

export async function getPublicProductRequest(productId: string) {
  return apiRequest<
    Product & {
      organizationName?: string
      organizationSlug?: string
      organizationDescription?: string | null
      businessType?: string | null
    }
  >(`/catalog/products/${productId}`)
}

export async function listProductsRequest(orgId: string) {
  return apiRequest<Product[]>(`/organizations/${orgId}/products`)
}

export async function listProductCategoriesRequest(orgId: string) {
  return apiRequest<ProductCategory[]>(
    `/organizations/${orgId}/products/categories`,
  )
}

export async function getProductRequest(orgId: string, productId: string) {
  return apiRequest<Product>(`/organizations/${orgId}/products/${productId}`)
}

export async function createProductRequest(
  orgId: string,
  payload: CreateProductPayload,
) {
  return apiRequest<Product>(`/organizations/${orgId}/products`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProductRequest(
  orgId: string,
  productId: string,
  payload: UpdateProductPayload,
) {
  return apiRequest<Product>(`/organizations/${orgId}/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteProductRequest(orgId: string, productId: string) {
  return apiRequest<{ message: string }>(
    `/organizations/${orgId}/products/${productId}`,
    { method: 'DELETE' },
  )
}

export async function restoreProductRequest(orgId: string, productId: string) {
  return apiRequest<Product>(
    `/organizations/${orgId}/products/${productId}/restore`,
    { method: 'POST' },
  )
}

export async function permanentlyDeleteProductRequest(
  orgId: string,
  productId: string,
) {
  return apiRequest<{ message: string }>(
    `/organizations/${orgId}/products/${productId}/permanent`,
    { method: 'DELETE' },
  )
}

export async function uploadProductImageRequest(
  orgId: string,
  productId: string,
  file: File,
  alt?: string,
) {
  const formData = new FormData()
  formData.append('file', file)
  if (alt) {
    formData.append('alt', alt)
  }

  return apiRequest<{
    message: string
    image: ProductImage
  }>(`/upload/organizations/${orgId}/products/${productId}/images`, {
    method: 'POST',
    body: formData,
  })
}
