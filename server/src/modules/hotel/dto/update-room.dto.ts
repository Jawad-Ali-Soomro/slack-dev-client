import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreateRoomDto } from './create-room.dto';

export class UpdateRoomDto extends PartialType(
  OmitType(CreateRoomDto, [] as const),
) {
  @ApiPropertyOptional({ enum: ['open', 'closed'] })
  @IsOptional()
  @IsIn(['open', 'closed'])
  declare status?: 'open' | 'closed';
}
