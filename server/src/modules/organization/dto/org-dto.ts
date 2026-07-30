import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateIf,
} from 'class-validator';

const BUSINESS_TYPES = [
  'e-commerce',
  'hotel-management',
  'hostel-management',
  'pharmacy',
] as const;

const LODGING_BUSINESS_TYPES = new Set([
  'hotel-management',
  'hostel-management',
]);

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corp', minLength: 3, maxLength: 100 })
  @IsString()
  @Length(3, 100)
  name!: string;

  @ApiProperty({ example: 'acme-corp', minLength: 3, maxLength: 50 })
  @IsString()
  @Length(3, 50)
  slug!: string;

  @ApiPropertyOptional({ example: 'Our main organization' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://acme.example.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    example: 'e-commerce',
    enum: BUSINESS_TYPES,
    description:
      'Business type — lodging types use rooms (not products); location is required',
  })
  @IsString()
  @IsIn(BUSINESS_TYPES)
  businessType!: string;

  @ApiPropertyOptional({
    example: 'Lahore',
    description: 'Required for hotel and hostel businesses',
  })
  @ValidateIf((o: CreateOrganizationDto) =>
    LODGING_BUSINESS_TYPES.has(o.businessType),
  )
  @IsString()
  @Length(2, 100)
  city?: string;

  @ApiPropertyOptional({
    example: 'Pakistan',
    description: 'Required for hotel and hostel businesses',
  })
  @ValidateIf((o: CreateOrganizationDto) =>
    LODGING_BUSINESS_TYPES.has(o.businessType),
  )
  @IsString()
  @Length(2, 100)
  country?: string;

  @ApiPropertyOptional({
    example: '12 Mall Road',
    description: 'Street address for hotel and hostel properties',
  })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  address?: string;

  @ApiPropertyOptional({
    example: 'admin@example.com',
    description:
      'Existing user email to assign as business admin (platform ADMIN)',
  })
  @IsOptional()
  @IsEmail()
  adminEmail?: string;
}
