import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './modules/prisma/prisma.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { OrganizationModule } from './modules/organization/organization.module';
import { TeamModule } from './modules/team/team.module';
import { UploadModule } from './modules/upload/upload.module';
import { ProductModule } from './modules/product/product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { PaginationModule } from './modules/common/pagination';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PaginationModule,
    PrismaModule,
    AuthModule,
    OrganizationModule,
    TeamModule,
    UploadModule,
    ProductModule,
    InventoryModule,
    HotelModule,
    NotificationModule,
    UserModule,
    OrderModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
