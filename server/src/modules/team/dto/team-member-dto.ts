import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamRole } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsOptional } from 'class-validator';

export class AddTeamMemberDto {
  @ApiPropertyOptional({
    example: 2,
    description: 'User ID (must be an organization member)',
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({
    example: 'jane@example.com',
    description: 'User email (must be an organization member)',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    enum: TeamRole,
    example: TeamRole.MEMBER,
    default: TeamRole.MEMBER,
  })
  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;
}

export class UpdateTeamMemberDto {
  @ApiProperty({ enum: TeamRole, example: TeamRole.LEAD })
  @IsEnum(TeamRole)
  role!: TeamRole;
}
