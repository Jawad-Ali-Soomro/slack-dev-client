import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';

export const CATALOG_SORT_OPTIONS = [
  'featured',
  'newest',
  'price_asc',
  'price_desc',
  'name',
] as const;

export type CatalogSort = (typeof CATALOG_SORT_OPTIONS)[number];

export class CatalogProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'e-commerce | pharmacy',
  })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiPropertyOptional({ description: 'Search name, description, category, org' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Category name or slug (case-insensitive)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Minimum price in major currency units (e.g. 10.5)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price in major currency units',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: CATALOG_SORT_OPTIONS, default: 'featured' })
  @IsOptional()
  @IsIn(CATALOG_SORT_OPTIONS)
  sort?: CatalogSort;

  @ApiPropertyOptional({ description: 'Only featured products when true' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  featured?: boolean;
}
