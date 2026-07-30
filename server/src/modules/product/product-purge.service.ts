import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductService } from './product.service';

@Injectable()
export class ProductPurgeService {
  private readonly logger = new Logger(ProductPurgeService.name);

  constructor(private readonly productService: ProductService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeExpiredDeletedProducts() {
    try {
      const { deletedCount } =
        await this.productService.purgeExpiredDeleted();
      if (deletedCount > 0) {
        this.logger.log(
          `Purged ${deletedCount} product(s) soft-deleted more than 7 days ago`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to purge expired deleted products',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
