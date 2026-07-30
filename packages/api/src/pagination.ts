export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type PaginatedResult<T> = {
  items: T[]
  meta: PaginationMeta
}

export function emptyPaginatedResult<T>(
  page = 1,
  limit = 12,
): PaginatedResult<T> {
  return {
    items: [],
    meta: {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  }
}

/** Normalize legacy array responses or paginated envelopes. */
export function unwrapPaginated<T>(
  data: PaginatedResult<T> | T[] | null | undefined,
  fallbackLimit = 12,
): PaginatedResult<T> {
  if (Array.isArray(data)) {
    return {
      items: data,
      meta: {
        page: 1,
        limit: fallbackLimit,
        total: data.length,
        totalPages: data.length > 0 ? 1 : 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }
  }

  if (data && Array.isArray(data.items) && data.meta) {
    return data
  }

  return emptyPaginatedResult<T>(1, fallbackLimit)
}
