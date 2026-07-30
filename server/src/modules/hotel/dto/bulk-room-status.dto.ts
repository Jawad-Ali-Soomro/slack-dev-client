import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsIn, IsString } from 'class-validator';

export class BulkRoomStatusDto {
  @ApiProperty({ type: [String], example: ['roomId1', 'roomId2'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  roomIds!: string[];

  @ApiProperty({ enum: ['open', 'closed'] })
  @IsIn(['open', 'closed'])
  status!: 'open' | 'closed';
}
