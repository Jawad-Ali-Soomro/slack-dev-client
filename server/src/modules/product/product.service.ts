import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRole, Prisma, Role } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UPLOADS_ROOT } from '../upload/config/multer.config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { ProductAttributesDto } from './dto/product-attributes.dto';
import { PaginationService } from '../common/pagination';

const PRODUCT_CATEGORIES_BY_BUSINESS: Record<string, string[]> = {
  'e-commerce': [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Beauty',
    'Sports',
    'Other',
  ],
  'hotel-management': [
    'Single Bedroom',
    'Double Bedroom',
    'Shared Room',
    'Suite',
    'Family Room',
    'Other',
  ],
  'hostel-management': [
    'Single Bedroom',
    'Shared Dorm',
    'Private Room',
    'Twin Room',
    'Other',
  ],
  pharmacy: [
    'OTC Medicines',
    'Prescription',
    'Supplements',
    'Personal Care',
    'First Aid',
    'Other',
  ],
};

const LODGING_BUSINESS_TYPES = new Set([
  'hotel-management',
  'hostel-management',
]);

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  images: {
    select: {
      id: true,
      url: true,
      alt: true,
    },
    orderBy: { createdAt: 'asc' as const },
  },
  inventory: {
    select: {
      id: true,
      quantity: true,
      reservedQty: true,
      reorderLevel: true,
    },
  },
  organization: {
    select: {
      businessType: true,
    },
  },
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  private toCents(price: number) {
    return Math.round(price * 100);
  }

  private fromCents(cents: number) {
    return Number((cents / 100).toFixed(2));
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
  }

  private generateSku(name: string) {
    const base = name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24);
    const suffix = Date.now().toString(36).toUpperCase().slice(-6);
    return `${base || 'PROD'}-${suffix}`;
  }

  private serializeProduct<
    T extends {
      price: number;
      organization?: { businessType?: string | null } | null;
      inventory?:
        | {
            id: string;
            quantity: number;
            reservedQty: number;
            reorderLevel?: number | null;
          }
        | {
            id: string;
            quantity: number;
            reservedQty: number;
            reorderLevel?: number | null;
          }[]
        | null;
    },
  >(product: T, businessType?: string | null) {
    const resolvedType =
      businessType ?? product.organization?.businessType ?? null;
    const isLodging = LODGING_BUSINESS_TYPES.has(resolvedType ?? '');

    const inventoryRow = Array.isArray(product.inventory)
      ? (product.inventory[0] ?? null)
      : (product.inventory ?? null);

    const inventory = inventoryRow
      ? {
          id: inventoryRow.id,
          quantity: inventoryRow.quantity,
          reservedQty: inventoryRow.reservedQty,
          reorderLevel: inventoryRow.reorderLevel ?? null,
          available: Math.max(
            0,
            inventoryRow.quantity - inventoryRow.reservedQty,
          ),
          inStock:
            inventoryRow.quantity - inventoryRow.reservedQty > 0,
        }
      : null;

    const { inventory: _inventory, organization: _organization, ...rest } =
      product;

    // Hotels/hostels manage availability via rooms, not product inventory
    if (isLodging) {
      return {
        ...rest,
        price: this.fromCents(product.price),
        priceCents: product.price,
        inventory: null,
        inStock: true,
        availableQuantity: null,
        stockTracked: false,
      };
    }

    return {
      ...rest,
      price: this.fromCents(product.price),
      priceCents: product.price,
      inventory,
      inStock: inventory?.inStock ?? false,
      availableQuantity: inventory?.available ?? 0,
      stockTracked: true,
    };
  }

  private async assertOrgExists(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, businessType: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  private assertCategoryForBusiness(
    businessType: string | null | undefined,
    categoryName: string,
  ) {
    const allowed =
      (businessType && PRODUCT_CATEGORIES_BY_BUSINESS[businessType]) || null;

    if (!allowed) {
      return;
    }

    const normalized = categoryName.trim().toLowerCase();
    const match = allowed.find((item) => item.toLowerCase() === normalized);

    if (!match) {
      const label = businessType ?? 'this business';
      throw new BadRequestException(
        `Category "${categoryName}" is not allowed for ${label}. Use one of: ${allowed.join(', ')}`,
      );
    }

    return match;
  }

  private normalizeAttributes(
    businessType: string | null | undefined,
    attributes?: ProductAttributesDto,
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
    if (attributes === undefined) {
      return undefined;
    }

    if (!LODGING_BUSINESS_TYPES.has(businessType ?? '')) {
      return Prisma.JsonNull;
    }

    const cleaned: Record<string, string | number> = {};

    if (attributes.climate) cleaned.climate = attributes.climate;
    if (attributes.bathroom) cleaned.bathroom = attributes.bathroom;
    if (attributes.mealPlan) cleaned.mealPlan = attributes.mealPlan;
    if (attributes.view) cleaned.view = attributes.view;
    if (attributes.stayDays != null) cleaned.stayDays = attributes.stayDays;
    if (attributes.maxGuests != null) cleaned.maxGuests = attributes.maxGuests;
    if (attributes.bedCount != null) cleaned.bedCount = attributes.bedCount;
    if (attributes.city?.trim()) cleaned.city = attributes.city.trim();
    if (attributes.area?.trim()) cleaned.area = attributes.area.trim();
    if (attributes.country?.trim()) cleaned.country = attributes.country.trim();
    if (attributes.address?.trim()) cleaned.address = attributes.address.trim();
    if (attributes.notes?.trim()) cleaned.notes = attributes.notes.trim();

    return Object.keys(cleaned).length
      ? (cleaned as Prisma.InputJsonValue)
      : Prisma.JsonNull;
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

  private async assertProductManager(organizationId: string, userId: number) {
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
        'Only the business admin can manage products',
      );
    }

    return membership;
  }

  private async findOrCreateCategory(
    organizationId: string,
    categoryName: string,
  ) {
    const name = categoryName.trim();
    const slug = this.slugify(name) || 'general';

    return this.prisma.productCategory.upsert({
      where: {
        organizationId_slug: {
          organizationId,
          slug,
        },
      },
      create: {
        name,
        slug,
        organizationId,
      },
      update: {
        name,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  async listCategories(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    return this.prisma.productCategory.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(
    organizationId: string,
    dto: CreateProductDto,
    userId: number,
    _requesterRole: Role,
  ) {
    await this.assertProductManager(organizationId, userId);
    const organization = await this.assertOrgExists(organizationId);

    if (LODGING_BUSINESS_TYPES.has(organization.businessType ?? '')) {
      throw new BadRequestException(
        'Hotels and hostels manage rooms instead of products. Use Hotel rooms to add inventory.',
      );
    }

    const categoryName = this.assertCategoryForBusiness(
      organization.businessType,
      dto.category,
    );

    const sku = dto.sku?.trim() || this.generateSku(dto.name);
    const category = await this.findOrCreateCategory(
      organizationId,
      categoryName ?? dto.category,
    );

    const attributes = this.normalizeAttributes(
      organization.businessType,
      dto.attributes,
    );

    const product = await this.prisma.product.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        sku,
        price: this.toCents(dto.price),
        isFeatured: dto.isFeatured ?? false,
        status: dto.status ?? 'draft',
        organizationId,
        categoryId: category.id,
        ...(attributes !== undefined ? { attributes } : {}),
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async findAll(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    const products = await this.prisma.product.findMany({
      where: { organizationId },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.serializeProduct(product));
  }

  async findPublicCatalog(options?: {
    businessType?: string;
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const allowedTypes = ['e-commerce', 'pharmacy'];

    const businessType = options?.businessType?.trim() || undefined;
    const query = options?.q?.trim() || undefined;
    const category = options?.category?.trim() || undefined;
    const sort = options?.sort?.trim() || 'featured';

    if (businessType && !allowedTypes.includes(businessType)) {
      throw new BadRequestException(
        `businessType must be one of: ${allowedTypes.join(', ')}`,
      );
    }

    const minCents =
      options?.minPrice != null && Number.isFinite(options.minPrice)
        ? Math.round(Number(options.minPrice) * 100)
        : undefined;
    const maxCents =
      options?.maxPrice != null && Number.isFinite(options.maxPrice)
        ? Math.round(Number(options.maxPrice) * 100)
        : undefined;

    if (minCents != null && maxCents != null && minCents > maxCents) {
      throw new BadRequestException('minPrice cannot be greater than maxPrice');
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      status: 'published',
      ...(options?.featured === true ? { isFeatured: true } : {}),
      ...(minCents != null || maxCents != null
        ? {
            price: {
              ...(minCents != null ? { gte: minCents } : {}),
              ...(maxCents != null ? { lte: maxCents } : {}),
            },
          }
        : {}),
      organization: {
        isActive: true,
        ...(businessType
          ? { businessType }
          : { businessType: { in: allowedTypes } }),
      },
      ...(category
        ? {
            category: {
              OR: [
                { name: { equals: category, mode: 'insensitive' as const } },
                { slug: { equals: category, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              {
                description: {
                  contains: query,
                  mode: 'insensitive' as const,
                },
              },
              {
                category: {
                  name: { contains: query, mode: 'insensitive' as const },
                },
              },
              {
                organization: {
                  name: { contains: query, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      sort === 'price_asc'
        ? [{ price: 'asc' }, { createdAt: 'desc' }]
        : sort === 'price_desc'
          ? [{ price: 'desc' }, { createdAt: 'desc' }]
          : sort === 'name'
            ? [{ name: 'asc' }]
            : sort === 'newest'
              ? [{ createdAt: 'desc' }]
              : [{ isFeatured: 'desc' }, { createdAt: 'desc' }];

    const { skip, take, page, limit } = this.pagination.getPage({
      page: options?.page,
      limit: options?.limit,
    });

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          ...productInclude,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              businessType: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
    ]);

    const items = products.map((product) => {
      const { organization, ...rest } = product;
      return {
        ...this.serializeProduct(rest, organization.businessType),
        organizationId: organization.id,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        businessType: organization.businessType,
      };
    });

    return this.pagination.buildResult(items, total, page, limit);
  }

  async getPublicCatalogFilters(businessType?: string) {
    const allowedTypes = ['e-commerce', 'pharmacy'];

    const type = businessType?.trim() || undefined;
    if (type && !allowedTypes.includes(type)) {
      throw new BadRequestException(
        `businessType must be one of: ${allowedTypes.join(', ')}`,
      );
    }

    const baseWhere: Prisma.ProductWhereInput = {
      isActive: true,
      status: 'published',
      organization: {
        isActive: true,
        ...(type
          ? { businessType: type }
          : { businessType: { in: allowedTypes } }),
      },
    };

    const [categories, priceAgg, businessTypes] = await Promise.all([
      this.prisma.productCategory.findMany({
        where: {
          products: { some: baseWhere },
        },
        select: { name: true, slug: true },
        orderBy: { name: 'asc' },
        distinct: ['slug'],
      }),
      this.prisma.product.aggregate({
        where: baseWhere,
        _min: { price: true },
        _max: { price: true },
      }),
      this.prisma.organization.findMany({
        where: {
          isActive: true,
          businessType: type
            ? type
            : { in: allowedTypes },
          products: { some: { isActive: true, status: 'published' } },
        },
        select: { businessType: true },
        distinct: ['businessType'],
      }),
    ]);

    return {
      categories: categories.map((c) => ({
        name: c.name,
        slug: c.slug,
      })),
      businessTypes: businessTypes
        .map((b) => b.businessType)
        .filter(Boolean),
      price: {
        min:
          priceAgg._min.price != null
            ? Number((priceAgg._min.price / 100).toFixed(2))
            : 0,
        max:
          priceAgg._max.price != null
            ? Number((priceAgg._max.price / 100).toFixed(2))
            : 0,
      },
      sortOptions: [
        'featured',
        'newest',
        'price_asc',
        'price_desc',
        'name',
      ],
    };
  }

  async findPublicProduct(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
        status: 'published',
        organization: {
          isActive: true,
          businessType: {
            in: [
              'e-commerce',
              'pharmacy',
              'hotel-management',
              'hostel-management',
            ],
          },
        },
      },
      include: {
        ...productInclude,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            businessType: true,
            description: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { organization, ...rest } = product;
    return {
      ...this.serializeProduct(rest, organization.businessType),
      organizationId: organization.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      organizationDescription: organization.description,
      businessType: organization.businessType,
    };
  }

  async findOne(
    organizationId: string,
    productId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    const product = await this.prisma.product.findFirst({
      where: { id: productId, organizationId },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.serializeProduct(product);
  }

  async update(
    organizationId: string,
    productId: string,
    dto: UpdateProductDto,
    userId: number,
    _requesterRole: Role,
  ) {
    await this.assertProductManager(organizationId, userId);
    const organization = await this.assertOrgExists(organizationId);

    const existing = await this.prisma.product.findFirst({
      where: { id: productId, organizationId },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (existing.status === 'deleted') {
      throw new BadRequestException(
        'Deleted products cannot be edited. Restore the product first.',
      );
    }

    let categoryId: string | undefined;
    if (dto.category !== undefined) {
      const categoryName = this.assertCategoryForBusiness(
        organization.businessType,
        dto.category,
      );
      const category = await this.findOrCreateCategory(
        organizationId,
        categoryName ?? dto.category,
      );
      categoryId = category.id;
    }

    const attributes = this.normalizeAttributes(
      organization.businessType,
      dto.attributes,
    );

    const nextStatus = dto.status;
    const softDeleting = nextStatus === 'deleted';

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
        ...(dto.sku !== undefined ? { sku: dto.sku.trim() } : {}),
        ...(dto.price !== undefined ? { price: this.toCents(dto.price) } : {}),
        ...(dto.isFeatured !== undefined
          ? { isFeatured: dto.isFeatured }
          : {}),
        ...(nextStatus !== undefined ? { status: nextStatus } : {}),
        ...(softDeleting
          ? { isActive: false, deletedAt: new Date() }
          : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(attributes !== undefined ? { attributes } : {}),
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async remove(
    organizationId: string,
    productId: string,
    userId: number,
    _requesterRole: Role,
  ) {
    await this.assertProductManager(organizationId, userId);

    const existing = await this.prisma.product.findFirst({
      where: { id: productId, organizationId },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (existing.status === 'deleted') {
      return { message: 'Product already deleted' };
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        status: 'deleted',
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { message: 'Product deleted successfully' };
  }

  async restore(
    organizationId: string,
    productId: string,
    userId: number,
    _requesterRole: Role,
  ) {
    await this.assertProductManager(organizationId, userId);

    const existing = await this.prisma.product.findFirst({
      where: { id: productId, organizationId },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (existing.status !== 'deleted') {
      throw new BadRequestException('Only deleted products can be restored');
    }

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        status: 'published',
        isActive: true,
        deletedAt: null,
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  /** Permanently remove a soft-deleted product from the organization. */
  async permanentlyRemove(
    organizationId: string,
    productId: string,
    userId: number,
    _requesterRole: Role,
  ) {
    await this.assertProductManager(organizationId, userId);

    const existing = await this.prisma.product.findFirst({
      where: { id: productId, organizationId },
      select: {
        id: true,
        status: true,
        images: { select: { id: true, storageKey: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (existing.status !== 'deleted') {
      throw new BadRequestException(
        'Only deleted products can be permanently removed. Soft-delete the product first.',
      );
    }

    for (const image of existing.images) {
      try {
        await unlink(join(UPLOADS_ROOT, image.storageKey));
      } catch {
        // File may already be missing from disk.
      }
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { message: 'Product permanently deleted' };
  }

  /** Hard-delete soft-deleted products older than 7 days. */
  async purgeExpiredDeleted() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const expired = await this.prisma.product.findMany({
      where: {
        status: 'deleted',
        deletedAt: { lte: cutoff },
      },
      select: {
        id: true,
        images: { select: { storageKey: true } },
      },
    });

    for (const product of expired) {
      for (const image of product.images) {
        try {
          await unlink(join(UPLOADS_ROOT, image.storageKey));
        } catch {
          // File may already be missing from disk.
        }
      }
    }

    const result = await this.prisma.product.deleteMany({
      where: {
        id: { in: expired.map((product) => product.id) },
      },
    });

    return { deletedCount: result.count };
  }
}
