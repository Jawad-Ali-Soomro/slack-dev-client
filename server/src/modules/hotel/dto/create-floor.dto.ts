import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class CreateFloorDto {
  @ApiProperty({ example: 'Ground Floor' })
  @IsString()
  @Length(1, 80)
  name!: string;

  @ApiProperty({ example: 1, description: 'Floor level (unique per organization)' })
  @Type(() => Number)
  @IsInt()
  level!: number;
}
