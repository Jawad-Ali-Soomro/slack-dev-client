import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './org-dto';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}