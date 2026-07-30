import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { CurrentUser } from '../../decorators/user-decorators';
import type { JwtPayload } from '../auth/interfaces/jwt.interface';
import { HotelService } from './hotel.service';

@ApiTags('Hotel Catalog')
@ApiBearerAuth('access-token')
@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class HotelMyBookingsController {
  constructor(private readonly hotelService: HotelService) {}

  @Get('my-bookings')
  @ApiOperation({ summary: 'List reservations for the logged-in user' })
  listMine(@CurrentUser() user: JwtPayload) {
    return this.hotelService.listMyBookings(user.sub);
  }
}
