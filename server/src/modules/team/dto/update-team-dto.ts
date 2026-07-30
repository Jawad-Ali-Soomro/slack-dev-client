import { PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './team-dto';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}
