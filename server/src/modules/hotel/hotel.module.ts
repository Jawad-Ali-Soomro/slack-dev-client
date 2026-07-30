import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HotelCatalogController } from './hotel-catalog.controller';
import { HotelController } from './hotel.controller';
import { HotelMyBookingsController } from './hotel-my-bookings.controller';
import { HotelService } from './hotel.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    HotelController,
    HotelCatalogController,
    HotelMyBookingsController,
  ],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
