import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationsController } from './organization.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationsController],
  providers: [OrganizationService],
})

export class OrganizationModule {}