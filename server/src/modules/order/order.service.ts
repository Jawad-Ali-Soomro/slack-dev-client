import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

type OrderItemCreateData = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    organization: { select: { id: true; name: true; slug: true } };
    items: true;
  };
}>;

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeOrder(order: {
    id: string;
    status: string;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    organization: { id: string; name: string; slug: string };
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    return {
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice / 100,
      totalPriceCents: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      organizationId: order.organization.id,
      organizationName: order.organization.name,
      organizationSlug: order.organization.slug,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice / 100,
        unitPriceCents: item.unitPrice,
        lineTotal: (item.unitPrice * item.quantity) / 100,
      })),
    };
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    const productIds = [...new Set(dto.items.map((item) => item.productId))];

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'published',
        isActive: true,
        deletedAt: null,
      },
      include: {
        inventory: true,
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products are unavailable');
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const quantityMap = new Map<string, number>();

    for (const item of dto.items) {
      quantityMap.set(
        item.productId,
        (quantityMap.get(item.productId) ?? 0) + item.quantity,
      );
    }

    for (const [productId, quantity] of quantityMap.entries()) {
      const product = productMap.get(productId);
      if (!product) continue;

      if (!product.inventory) {
        throw new BadRequestException(
          `${product.name} is not available for purchase`,
        );
      }

      const available = Math.max(
        0,
        product.inventory.quantity - product.inventory.reservedQty,
      );

      if (available < quantity) {
        throw new BadRequestException(
          `Not enough stock for ${product.name}. Available: ${available}`,
        );
      }
    }

    const itemsByOrg = new Map<
      string,
      Array<{ productId: string; quantity: number }>
    >();

    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      const list = itemsByOrg.get(product.organizationId) ?? [];
      list.push({ productId: item.productId, quantity: item.quantity });
      itemsByOrg.set(product.organizationId, list);
    }

    const createdOrders = await this.prisma.$transaction(async (tx) => {
      const orders: OrderWithRelations[] = [];

      for (const [organizationId, orgItems] of itemsByOrg.entries()) {
        const merged = new Map<string, number>();
        for (const item of orgItems) {
          merged.set(
            item.productId,
            (merged.get(item.productId) ?? 0) + item.quantity,
          );
        }

        let totalPrice = 0;
        const orderItemsData: OrderItemCreateData[] = [];

        for (const [productId, quantity] of merged.entries()) {
          const product = productMap.get(productId);
          if (!product) continue;

          totalPrice += product.price * quantity;
          orderItemsData.push({
            productId,
            productName: product.name,
            quantity,
            unitPrice: product.price,
          });

          await tx.inventory.update({
            where: { productId },
            data: { quantity: { decrement: quantity } },
          });
        }

        const order = await tx.order.create({
          data: {
            userId,
            organizationId,
            totalPrice,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
            items: true,
          },
        });

        orders.push(order);
      }

      return orders;
    });

    return createdOrders.map((order) => this.serializeOrder(order));
  }

  async listMyOrders(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.serializeOrder(order));
  }
}
