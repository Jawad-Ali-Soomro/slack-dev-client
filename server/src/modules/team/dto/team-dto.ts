import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Engineering', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ example: 'engineering', minLength: 2, maxLength: 50 })
  @IsString()
  @Length(2, 50)
  slug!: string;

  @ApiPropertyOptional({ example: 'Product engineering team' })
  @IsOptional()
  @IsString()
  description?: string;
}
