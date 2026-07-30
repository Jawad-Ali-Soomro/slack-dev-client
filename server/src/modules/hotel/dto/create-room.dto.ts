import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'floorId123' })
  @IsString()
  floorId!: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @Length(1, 20)
  number!: string;

  @ApiPropertyOptional({ example: 'Ocean View' })
  @IsOptional()
  @IsString()
  @Length(0, 80)
  label?: string;

  @ApiProperty({ example: 'Double Bedroom' })
  @IsString()
  @Length(1, 80)
  roomType!: string;

  @ApiProperty({
    example: 120,
    description: 'Price per night in major currency units (e.g. dollars)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 2, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: 'open', enum: ['open', 'closed'] })
  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: 'open' | 'closed';

  @ApiPropertyOptional({ example: 'ac', enum: ['ac', 'non-ac'] })
  @IsOptional()
  @IsIn(['ac', 'non-ac'])
  climate?: 'ac' | 'non-ac';

  @ApiPropertyOptional({ example: 'private', enum: ['private', 'shared'] })
  @IsOptional()
  @IsIn(['private', 'shared'])
  bathroom?: 'private' | 'shared';
}
