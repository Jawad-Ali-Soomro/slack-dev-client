import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export const PRODUCT_CLIMATE_OPTIONS = ['ac', 'non-ac'] as const;
export const PRODUCT_BATHROOM_OPTIONS = ['private', 'shared'] as const;
export const PRODUCT_MEAL_PLAN_OPTIONS = [
  'none',
  'breakfast',
  'half-board',
  'full-board',
] as const;
export const PRODUCT_VIEW_OPTIONS = [
  'city',
  'garden',
  'pool',
  'mountain',
  'none',
] as const;

export class ProductAttributesDto {
  @ApiPropertyOptional({
    enum: PRODUCT_CLIMATE_OPTIONS,
    example: 'ac',
    description: 'AC or non-AC for hotel/hostel rooms',
  })
  @IsOptional()
  @IsIn(PRODUCT_CLIMATE_OPTIONS)
  climate?: (typeof PRODUCT_CLIMATE_OPTIONS)[number];

  @ApiPropertyOptional({
    enum: PRODUCT_BATHROOM_OPTIONS,
    example: 'private',
  })
  @IsOptional()
  @IsIn(PRODUCT_BATHROOM_OPTIONS)
  bathroom?: (typeof PRODUCT_BATHROOM_OPTIONS)[number];

  @ApiPropertyOptional({
    enum: PRODUCT_MEAL_PLAN_OPTIONS,
    example: 'breakfast',
  })
  @IsOptional()
  @IsIn(PRODUCT_MEAL_PLAN_OPTIONS)
  mealPlan?: (typeof PRODUCT_MEAL_PLAN_OPTIONS)[number];

  @ApiPropertyOptional({
    enum: PRODUCT_VIEW_OPTIONS,
    example: 'city',
  })
  @IsOptional()
  @IsIn(PRODUCT_VIEW_OPTIONS)
  view?: (typeof PRODUCT_VIEW_OPTIONS)[number];

  @ApiPropertyOptional({
    example: 1,
    description: 'Minimum / default days of stay',
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  stayDays?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Maximum guests for the room',
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  maxGuests?: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'Bed count for dorm / shared rooms',
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  bedCount?: number;

  @ApiPropertyOptional({
    example: 'Lahore',
    description: 'City for hotel/hostel listings',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'Gulberg III',
    description: 'Area / neighborhood',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({
    example: 'Pakistan',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: '12 Main Boulevard',
    description: 'Street address or landmark',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Quiet courtyard room',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
