import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsOptional } from 'class-validator';

export class AddMemberDto {
  @ApiPropertyOptional({ example: 2, description: 'User ID to add (provide userId or email)' })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ example: 'jane@example.com', description: 'User email to add (provide userId or email)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    enum: OrganizationRole,
    example: OrganizationRole.MEMBER,
    default: OrganizationRole.MEMBER,
  })
  @IsOptional()
  @IsEnum(OrganizationRole)
  role?: OrganizationRole;
}

export class UpdateMemberDto {
  @ApiProperty({
    enum: OrganizationRole,
    example: OrganizationRole.ADMIN,
  })
  @IsEnum(OrganizationRole)
  role!: OrganizationRole;
}
