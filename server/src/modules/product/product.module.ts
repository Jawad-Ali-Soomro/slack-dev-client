import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CatalogController } from './catalog.controller';
import { ProductController } from './product.controller';
import { ProductPurgeService } from './product-purge.service';
import { ProductService } from './product.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController, CatalogController],
  providers: [ProductService, ProductPurgeService],
})
export class ProductModule {}
