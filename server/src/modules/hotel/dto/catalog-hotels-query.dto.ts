import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';

export class CatalogHotelsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'hotel-management | hostel-management',
  })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiPropertyOptional({ description: 'Search name, city, or country' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by city (case-insensitive)' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by country (case-insensitive)' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    enum: ['name', 'newest'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'newest'])
  sort?: 'name' | 'newest';
}
