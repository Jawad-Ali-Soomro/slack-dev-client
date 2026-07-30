import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../decorators/public-decorator';
import { CurrentUser } from '../../decorators/user-decorators';
import type { JwtPayload } from '../auth/interfaces/jwt.interface';
import { CatalogHotelsQueryDto } from './dto/catalog-hotels-query.dto';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
import { HotelService } from './hotel.service';

@ApiTags('Hotel Catalog')
@Controller('catalog/hotels')
export class HotelCatalogController {
  constructor(private readonly hotelService: HotelService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List public lodging organizations (paginated)' })
  listHotels(@Query() query: CatalogHotelsQueryDto) {
    return this.hotelService.listPublicHotels(query);
  }

  @Public()
  @Get('filters')
  @ApiOperation({ summary: 'Available filter options for lodging catalog' })
  @ApiQuery({
    name: 'businessType',
    required: false,
    description: 'hotel-management or hostel-management',
  })
  getFilters(@Query('businessType') businessType?: string) {
    return this.hotelService.getPublicHotelFilters(businessType);
  }

  @Public()
  @Get(':orgIdOrSlug/availability')
  @ApiOperation({ summary: 'List rooms available for a date range' })
  @ApiParam({ name: 'orgIdOrSlug' })
  @ApiQuery({ name: 'checkIn', required: true })
  @ApiQuery({ name: 'checkOut', required: true })
  availability(
    @Param('orgIdOrSlug') orgIdOrSlug: string,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
  ) {
    return this.hotelService.getAvailability(
      orgIdOrSlug,
      checkIn ?? '',
      checkOut ?? '',
    );
  }

  @ApiBearerAuth('access-token')
  @Post(':orgIdOrSlug/bookings')
  @ApiOperation({
    summary: 'Create a reservation (authenticated users only; pending approval)',
  })
  @ApiParam({ name: 'orgIdOrSlug' })
  createBooking(
    @Param('orgIdOrSlug') orgIdOrSlug: string,
    @Body() dto: CreatePublicBookingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hotelService.createPublicBooking(orgIdOrSlug, dto, user.sub);
  }

  @Public()
  @Get(':orgIdOrSlug')
  @ApiOperation({ summary: 'Get public hotel detail with floors and rooms' })
  @ApiParam({ name: 'orgIdOrSlug' })
  getHotel(@Param('orgIdOrSlug') orgIdOrSlug: string) {
    return this.hotelService.getPublicHotel(orgIdOrSlug);
  }
}
