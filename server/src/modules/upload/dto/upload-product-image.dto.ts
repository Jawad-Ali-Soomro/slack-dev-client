import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadProductImageDto {
  @ApiPropertyOptional({
    example: 'Front view of product',
    description: 'Alternative text for the image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;
}
