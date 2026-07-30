import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductAttributesDto } from './product-attributes.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones', minLength: 2, maxLength: 150 })
  @IsString()
  @Length(2, 150)
  name!: string;

  @ApiPropertyOptional({ example: 'Noise-cancelling over-ear headphones' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @ApiProperty({
    example: 'Electronics',
    description: 'Product category name (must match business type)',
    minLength: 2,
    maxLength: 80,
  })
  @IsString()
  @Length(2, 80)
  category!: string;

  @ApiProperty({
    example: 89.99,
    description: 'Price in major currency units (e.g. dollars)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    example: 'WH-1000',
    description: 'Optional SKU; auto-generated when omitted',
  })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  sku?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: 'draft',
    enum: ['draft', 'published', 'deleted'],
    description:
      'Product status. Only published products appear in the marketplace.',
  })
  @IsOptional()
  @IsIn(['draft', 'published', 'deleted'])
  status?: 'draft' | 'published' | 'deleted';

  @ApiPropertyOptional({
    type: ProductAttributesDto,
    description:
      'Hotel/hostel lodging options (climate, stay days, bathroom, etc.)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductAttributesDto)
  attributes?: ProductAttributesDto;
}
