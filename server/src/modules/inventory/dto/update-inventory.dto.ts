import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateInventoryDto } from './create-inventory.dto';

export class UpdateInventoryDto extends PartialType(
  OmitType(CreateInventoryDto, ['productId'] as const),
) {
  @ApiPropertyOptional({
    example: 0,
    description: 'Quantity reserved for pending orders',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reservedQty?: number;
}
