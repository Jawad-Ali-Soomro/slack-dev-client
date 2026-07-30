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
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@Controller('organizations/:orgId/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({
    summary: 'List inventory records for an organization',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  findAll(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    return this.inventoryService.findAll(orgId, user.sub, user.role);
  }

  @Post()
  @ApiOperation({
    summary:
      'Create inventory for a product (one inventory per product; OWNER/ADMIN only)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.create(orgId, dto, user.sub, user.role);
  }

  @Patch(':inventoryId')
  @ApiOperation({
    summary: 'Update inventory quantity (OWNER/ADMIN only)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'inventoryId', description: 'Inventory ID' })
  update(
    @Param('orgId') orgId: string,
    @Param('inventoryId') inventoryId: string,
    @Body() dto: UpdateInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.update(
      orgId,
      inventoryId,
      dto,
      user.sub,
      user.role,
    );
  }

  @Delete(':inventoryId')
  @ApiOperation({
    summary: 'Delete an inventory record (OWNER/ADMIN only)',
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'inventoryId', description: 'Inventory ID' })
  remove(
    @Param('orgId') orgId: string,
    @Param('inventoryId') inventoryId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inventoryService.remove(
      orgId,
      inventoryId,
      user.sub,
      user.role,
    );
  }
}
