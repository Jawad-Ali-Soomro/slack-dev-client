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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('organizations/:orgId/products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a product (organization OWNER/ADMIN only)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productService.create(orgId, dto, user.sub, user.role);
  }

  @Get()
  @ApiOperation({ summary: 'List products in an organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  findAll(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    return this.productService.findAll(orgId, user.sub, user.role);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List product categories in an organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  listCategories(
    @Param('orgId') orgId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productService.listCategories(orgId, user.sub, user.role);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  findOne(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productService.findOne(
      orgId,
      productId,
      user.sub,
      user.role,
    );
  }

  @Patch(':productId')
  @ApiOperation({
    summary: 'Update a product (organization OWNER/ADMIN only)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  update(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productService.update(
      orgId,
      productId,
      dto,
      user.sub,
      user.role,
    );
  }

  @Post(':productId/restore')
  @ApiOperation({
    summary:
      'Restore a soft-deleted product and republish it (organization OWNER/ADMIN only)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  restore(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productService.restore(
      orgId,
      productId,
      user.sub,
      user.role,
    );
  }

  @Delete(':productId/permanent')
  @ApiOperation({
    summary:
      'Permanently delete a soft-deleted product from the organization (OWNER/ADMIN only)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  permanentlyRemove(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productService.permanentlyRemove(
      orgId,
      productId,
      user.sub,
      user.role,
    );
  }

  @Delete(':productId')
  @ApiOperation({
    summary:
      'Soft-delete a product (hidden from public; purged after 7 days if not restored)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  remove(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productService.remove(
      orgId,
      productId,
      user.sub,
      user.role,
    );
  }
}
