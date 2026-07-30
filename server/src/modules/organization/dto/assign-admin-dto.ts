import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AssignAdminDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Existing user email to hand the business to as admin/owner',
  })
  @IsEmail()
  email!: string;
}
