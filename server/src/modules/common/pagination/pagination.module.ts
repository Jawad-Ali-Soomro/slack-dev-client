import { Global, Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';

/**
 * Global pagination module — import once in AppModule; inject PaginationService anywhere.
 */
@Global()
@Module({
  providers: [PaginationService],
  exports: [PaginationService],
})
export class PaginationModule {}
