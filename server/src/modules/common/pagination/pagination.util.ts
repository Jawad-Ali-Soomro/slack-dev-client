import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from './pagination.dto';

export type PaginationInput = {
  page?: number | string | null;
  limit?: number | string | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type PrismaPageArgs = {
  skip: number;
  take: number;
  page: number;
  limit: number;
};

function toPositiveInt(value: number | string | null | undefined, fallback: number) {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

/**
 * Normalize page/limit and return Prisma skip/take.
 * Use across all list endpoints for consistent paging.
 */
export function getPrismaPage(input: PaginationInput = {}): PrismaPageArgs {
  const page = toPositiveInt(input.page, DEFAULT_PAGE);
  const rawLimit = toPositiveInt(input.limit, DEFAULT_LIMIT);
  const limit = Math.min(rawLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

/**
 * Build a standard paginated API response.
 */
export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const safeTotal = Math.max(0, Math.floor(total) || 0);
  const totalPages =
    safeTotal === 0 ? 0 : Math.ceil(safeTotal / Math.max(1, limit));

  return {
    items,
    meta: {
      page,
      limit,
      total: safeTotal,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1 && totalPages > 0,
    },
  };
}

/**
 * Convenience: run count + findMany pattern with shared page args.
 */
export async function paginateQuery<T>(options: {
  page?: number | string | null;
  limit?: number | string | null;
  count: () => Promise<number>;
  findMany: (args: { skip: number; take: number }) => Promise<T[]>;
}): Promise<PaginatedResult<T>> {
  const { skip, take, page, limit } = getPrismaPage({
    page: options.page,
    limit: options.limit,
  });

  const [total, items] = await Promise.all([
    options.count(),
    options.findMany({ skip, take }),
  ]);

  return paginate(items, total, page, limit);
}
