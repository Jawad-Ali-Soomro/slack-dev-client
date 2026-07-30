import { Injectable } from '@nestjs/common';
import {
  getPrismaPage,
  paginate,
  paginateQuery,
  type PaginatedResult,
  type PaginationInput,
  type PrismaPageArgs,
} from './pagination.util';

/**
 * Injectable pagination helper — inject into any service for consistent paging.
 */
@Injectable()
export class PaginationService {
  getPage(input: PaginationInput = {}): PrismaPageArgs {
    return getPrismaPage(input);
  }

  buildResult<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    return paginate(items, total, page, limit);
  }

  query<T>(options: {
    page?: number | string | null;
    limit?: number | string | null;
    count: () => Promise<number>;
    findMany: (args: { skip: number; take: number }) => Promise<T[]>;
  }): Promise<PaginatedResult<T>> {
    return paginateQuery(options);
  }
}
