import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/interfaces/jwt.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { CurrentUser } from '../../decorators/user-decorators';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { BulkRoomStatusDto } from './dto/bulk-room-status.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { HotelService } from './hotel.service';

@ApiTags('Hotel')
@ApiBearerAuth('access-token')
@Controller('organizations/:orgId')
@UseGuards(JwtAuthGuard)
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get('floors')
  @ApiOperation({ summary: 'List floors for a lodging organization' })
  @ApiParam({ name: 'orgId' })
  listFloors(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    return this.hotelService.listFloors(orgId, user.sub, user.role);
  }

  @Post('floors')
  @ApiOperation({ summary: 'Create a floor (OWNER/ADMIN)' })
  @ApiParam({ name: 'orgId' })
  createFloor(
    @Param('orgId') orgId: string,
    @Body() dto: CreateFloorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.createFloor(orgId, dto, user.sub, user.role);
  }

  @Patch('floors/:floorId')
  @ApiOperation({ summary: 'Update a floor (OWNER/ADMIN)' })
  updateFloor(
    @Param('orgId') orgId: string,
    @Param('floorId') floorId: string,
    @Body() dto: UpdateFloorDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.updateFloor(
      orgId,
      floorId,
      dto,
      user.sub,
      user.role,
    );
  }

  @Delete('floors/:floorId')
  @ApiOperation({ summary: 'Delete a floor (OWNER/ADMIN)' })
  deleteFloor(
    @Param('orgId') orgId: string,
    @Param('floorId') floorId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.deleteFloor(orgId, floorId, user.sub, user.role);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'List rooms for a lodging organization' })
  listRooms(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    return this.hotelService.listRooms(orgId, user.sub, user.role);
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create a room (OWNER/ADMIN)' })
  createRoom(
    @Param('orgId') orgId: string,
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.createRoom(orgId, dto, user.sub, user.role);
  }

  @Post('rooms/bulk-status')
  @ApiOperation({ summary: 'Bulk update room status (OWNER/ADMIN)' })
  bulkRoomStatus(
    @Param('orgId') orgId: string,
    @Body() dto: BulkRoomStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.bulkUpdateRoomStatus(
      orgId,
      dto,
      user.sub,
      user.role,
    );
  }

  @Patch('rooms/:roomId')
  @ApiOperation({ summary: 'Update a room (OWNER/ADMIN)' })
  updateRoom(
    @Param('orgId') orgId: string,
    @Param('roomId') roomId: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.updateRoom(
      orgId,
      roomId,
      dto,
      user.sub,
      user.role,
    );
  }

  @Delete('rooms/:roomId')
  @ApiOperation({ summary: 'Delete a room (OWNER/ADMIN)' })
  deleteRoom(
    @Param('orgId') orgId: string,
    @Param('roomId') roomId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.deleteRoom(orgId, roomId, user.sub, user.role);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List bookings for a lodging organization' })
  listBookings(
    @Param('orgId') orgId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.listBookings(orgId, user.sub, user.role);
  }

  @Patch('bookings/:bookingId')
  @ApiOperation({ summary: 'Update booking status e.g. cancel (OWNER/ADMIN)' })
  updateBooking(
    @Param('orgId') orgId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.updateBooking(
      orgId,
      bookingId,
      dto,
      user.sub,
      user.role,
    );
  }
}
