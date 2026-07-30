import { apiRequest } from './client'
import type { PaginatedResult } from './pagination'

export type HotelFloor = {
  id: string
  name: string
  level: number
  organizationId: string
  rooms?: HotelRoom[]
  _count?: { rooms: number }
  createdAt?: string
  updatedAt?: string
}

export type HotelRoom = {
  id: string
  number: string
  label?: string | null
  roomType: string
  price: number
  priceCents?: number
  capacity: number
  status: 'open' | 'closed' | string
  climate?: 'ac' | 'non-ac' | string
  bathroom?: 'private' | 'shared' | string
  floorId: string
  organizationId: string
  floor?: { id: string; name: string; level: number }
  /** True when room has a pending/confirmed booking for the queried dates */
  reserved?: boolean
  createdAt?: string
  updatedAt?: string
}

export type HotelBookingRoom = {
  id: string
  bookingId: string
  roomId: string
  room: HotelRoom
}

export type HotelBooking = {
  id: string
  organizationId: string
  checkIn: string
  checkOut: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | string
  totalPrice: number
  totalPriceCents?: number
  nights?: number
  organizationName?: string
  organizationSlug?: string
  rooms?: HotelBookingRoom[]
  userId?: number | null
  createdAt?: string
  updatedAt?: string
}

export type PublicHotel = {
  id: string
  name: string
  slug: string
  businessType?: string | null
  city?: string | null
  country?: string | null
  description?: string | null
  logo?: { id: string; url: string; alt?: string | null } | null
  floorCount?: number
  roomCount?: number
  openRoomCount?: number
  floors?: HotelFloor[]
  address?: string | null
}

export type HotelAvailability = {
  organizationId: string
  organizationName: string
  organizationSlug: string
  checkIn: string
  checkOut: string
  nights: number
  rooms: HotelRoom[]
}

export type CreateFloorPayload = {
  name: string
  level: number
}

export type UpdateFloorPayload = Partial<CreateFloorPayload>

export type CreateRoomPayload = {
  floorId: string
  number: string
  label?: string
  roomType: string
  price: number
  capacity?: number
  status?: 'open' | 'closed'
  climate?: 'ac' | 'non-ac'
  bathroom?: 'private' | 'shared'
}

export type UpdateRoomPayload = Partial<CreateRoomPayload>

export type CreatePublicBookingPayload = {
  checkIn: string
  checkOut: string
  roomIds: string[]
  guestName?: string
  guestEmail?: string
  guestPhone?: string
}

export async function listFloorsRequest(orgId: string) {
  return apiRequest<HotelFloor[]>(`/organizations/${orgId}/floors`)
}

export async function createFloorRequest(
  orgId: string,
  payload: CreateFloorPayload,
) {
  return apiRequest<HotelFloor>(`/organizations/${orgId}/floors`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateFloorRequest(
  orgId: string,
  floorId: string,
  payload: UpdateFloorPayload,
) {
  return apiRequest<HotelFloor>(
    `/organizations/${orgId}/floors/${floorId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
}

export async function deleteFloorRequest(orgId: string, floorId: string) {
  return apiRequest<{ message: string }>(
    `/organizations/${orgId}/floors/${floorId}`,
    { method: 'DELETE' },
  )
}

export async function listRoomsRequest(orgId: string) {
  return apiRequest<HotelRoom[]>(`/organizations/${orgId}/rooms`)
}

export async function createRoomRequest(
  orgId: string,
  payload: CreateRoomPayload,
) {
  return apiRequest<HotelRoom>(`/organizations/${orgId}/rooms`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateRoomRequest(
  orgId: string,
  roomId: string,
  payload: UpdateRoomPayload,
) {
  return apiRequest<HotelRoom>(`/organizations/${orgId}/rooms/${roomId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteRoomRequest(orgId: string, roomId: string) {
  return apiRequest<{ message: string }>(
    `/organizations/${orgId}/rooms/${roomId}`,
    { method: 'DELETE' },
  )
}

export async function bulkRoomStatusRequest(
  orgId: string,
  roomIds: string[],
  status: 'open' | 'closed',
) {
  return apiRequest<{ message: string; updatedCount: number; status: string }>(
    `/organizations/${orgId}/rooms/bulk-status`,
    {
      method: 'POST',
      body: JSON.stringify({ roomIds, status }),
    },
  )
}

export async function listBookingsRequest(orgId: string) {
  return apiRequest<HotelBooking[]>(`/organizations/${orgId}/bookings`)
}

export async function updateBookingRequest(
  orgId: string,
  bookingId: string,
  payload: { status: 'pending' | 'confirmed' | 'cancelled' },
) {
  return apiRequest<HotelBooking>(
    `/organizations/${orgId}/bookings/${bookingId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
}

export async function listPublicHotelsRequest(options?: {
  businessType?: string
  q?: string
  city?: string
  country?: string
  sort?: 'name' | 'newest'
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  if (options?.businessType) params.set('businessType', options.businessType)
  if (options?.q) params.set('q', options.q)
  if (options?.city) params.set('city', options.city)
  if (options?.country) params.set('country', options.country)
  if (options?.sort) params.set('sort', options.sort)
  if (options?.page != null) params.set('page', String(options.page))
  if (options?.limit != null) params.set('limit', String(options.limit))
  const query = params.toString()
  return apiRequest<PaginatedResult<PublicHotel>>(
    `/catalog/hotels${query ? `?${query}` : ''}`,
  )
}

export async function getPublicHotelFiltersRequest(businessType?: string) {
  const params = new URLSearchParams()
  if (businessType) params.set('businessType', businessType)
  const query = params.toString()
  return apiRequest<{
    cities: string[]
    countries: string[]
    sortOptions: string[]
  }>(`/catalog/hotels/filters${query ? `?${query}` : ''}`)
}

export async function getPublicHotelRequest(orgIdOrSlug: string) {
  return apiRequest<PublicHotel>(`/catalog/hotels/${orgIdOrSlug}`)
}

export async function getHotelAvailabilityRequest(
  orgIdOrSlug: string,
  checkIn: string,
  checkOut: string,
) {
  const params = new URLSearchParams({ checkIn, checkOut })
  return apiRequest<HotelAvailability>(
    `/catalog/hotels/${orgIdOrSlug}/availability?${params}`,
  )
}

export async function createPublicBookingRequest(
  orgIdOrSlug: string,
  payload: CreatePublicBookingPayload,
) {
  return apiRequest<HotelBooking>(
    `/catalog/hotels/${orgIdOrSlug}/bookings`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export async function listMyBookingsRequest() {
  return apiRequest<HotelBooking[]>('/catalog/my-bookings')
}
