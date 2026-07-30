import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from '../../decorators/public-decorator';
import { PaginatedResponseDto } from '../common/pagination';
import { CatalogProductsQueryDto } from './dto/catalog-products-query.dto';
import { ProductService } from './product.service';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get('products')
  @ApiOperation({
    summary: 'Public product catalog for the tenant marketplace (paginated)',
  })
  @ApiOkResponse({ type: PaginatedResponseDto })
  findPublic(@Query() query: CatalogProductsQueryDto) {
    return this.productService.findPublicCatalog(query);
  }

  @Public()
  @Get('products/filters')
  @ApiOperation({
    summary: 'Available filter options for the public product catalog',
  })
  getFilters(@Query('businessType') businessType?: string) {
    return this.productService.getPublicCatalogFilters(businessType);
  }

  @Public()
  @Get('products/:productId')
  @ApiOperation({ summary: 'Get a public product by ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  findOne(@Param('productId') productId: string) {
    return this.productService.findPublicProduct(productId);
  }
}
