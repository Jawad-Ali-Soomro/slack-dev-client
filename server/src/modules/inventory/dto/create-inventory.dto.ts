import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    example: 'clxyz123',
    description: 'Product ID that already belongs to this organization',
  })
  @IsString()
  productId!: string;

  @ApiProperty({
    example: 25,
    description: 'On-hand quantity available for sale',
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Optional low-stock reorder threshold',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reorderLevel?: number;
}
