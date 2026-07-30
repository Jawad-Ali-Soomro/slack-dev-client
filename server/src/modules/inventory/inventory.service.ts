import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRole, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeInventory<
    T extends {
      quantity: number;
      reservedQty: number;
      reorderLevel?: number | null;
    },
  >(inventory: T) {
    const available = Math.max(0, inventory.quantity - inventory.reservedQty);
    return {
      ...inventory,
      available,
      inStock: available > 0,
    };
  }

  private async assertOrgExists(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  private async assertCanAccess(
    organizationId: string,
    userId: number,
    requesterRole?: Role,
  ) {
    if (requesterRole === Role.SUPERADMIN) {
      await this.assertOrgExists(organizationId);
      return null;
    }

    const membership = await this.prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return membership;
  }

  private async assertInventoryManager(
    organizationId: string,
    userId: number,
    requesterRole?: Role,
  ) {
    if (requesterRole === Role.SUPERADMIN) {
      await this.assertOrgExists(organizationId);
      return;
    }

    const membership = await this.prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (
      !membership ||
      (membership.role !== OrganizationRole.OWNER &&
        membership.role !== OrganizationRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only organization OWNER or ADMIN can manage inventory',
      );
    }
  }

  async findAll(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    const inventories = await this.prisma.inventory.findMany({
      where: { organizationId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
            price: true,
            images: {
              select: { id: true, url: true, alt: true },
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return inventories.map((row) => ({
      ...this.serializeInventory(row),
      product: {
        ...row.product,
        price: Number((row.product.price / 100).toFixed(2)),
      },
    }));
  }

  async create(
    organizationId: string,
    dto: CreateInventoryDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertInventoryManager(organizationId, userId, requesterRole);

    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        organizationId,
        status: { not: 'deleted' },
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException(
        'Product not found in this organization. Create the product first.',
      );
    }

    const existing = await this.prisma.inventory.findUnique({
      where: { productId: dto.productId },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'This product already has inventory. Update the existing record instead.',
      );
    }

    const inventory = await this.prisma.inventory.create({
      data: {
        organizationId,
        productId: dto.productId,
        quantity: dto.quantity,
        reservedQty: 0,
        reorderLevel: dto.reorderLevel ?? null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
            price: true,
            images: {
              select: { id: true, url: true, alt: true },
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    return {
      ...this.serializeInventory(inventory),
      product: {
        ...inventory.product,
        price: Number((inventory.product.price / 100).toFixed(2)),
      },
    };
  }

  async update(
    organizationId: string,
    inventoryId: string,
    dto: UpdateInventoryDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertInventoryManager(organizationId, userId, requesterRole);

    const existing = await this.prisma.inventory.findFirst({
      where: { id: inventoryId, organizationId },
      select: { id: true, quantity: true, reservedQty: true },
    });

    if (!existing) {
      throw new NotFoundException('Inventory not found');
    }

    const nextQuantity =
      dto.quantity !== undefined ? dto.quantity : existing.quantity;
    const nextReserved =
      dto.reservedQty !== undefined ? dto.reservedQty : existing.reservedQty;

    if (nextReserved > nextQuantity) {
      throw new BadRequestException(
        'Reserved quantity cannot exceed on-hand quantity',
      );
    }

    const inventory = await this.prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
        ...(dto.reservedQty !== undefined
          ? { reservedQty: dto.reservedQty }
          : {}),
        ...(dto.reorderLevel !== undefined
          ? { reorderLevel: dto.reorderLevel }
          : {}),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
            price: true,
            images: {
              select: { id: true, url: true, alt: true },
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    return {
      ...this.serializeInventory(inventory),
      product: {
        ...inventory.product,
        price: Number((inventory.product.price / 100).toFixed(2)),
      },
    };
  }

  async remove(
    organizationId: string,
    inventoryId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertInventoryManager(organizationId, userId, requesterRole);

    const existing = await this.prisma.inventory.findFirst({
      where: { id: inventoryId, organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Inventory not found');
    }

    await this.prisma.inventory.delete({ where: { id: inventoryId } });

    return { message: 'Inventory deleted successfully' };
  }
}
