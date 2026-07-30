import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'active', description: 'active | suspended' })
  @IsOptional()
  @IsIn(['active', 'suspended'])
  status?: string;

  @ApiPropertyOptional({ example: 'USER', description: 'USER or ADMIN' })
  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: 'USER' | 'ADMIN';

  @ApiPropertyOptional({ description: 'Manually mark email as verified' })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
