import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImageType, OrganizationRole, Role } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UPLOADS_ROOT } from './config/multer.config';

const ADMIN_ROLES: OrganizationRole[] = ['OWNER', 'ADMIN'];

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  private buildPublicUrl(storageKey: string) {
    const baseUrl = process.env.UPLOAD_BASE_URL?.replace(/\/$/, '') ?? '';
    const path = `/uploads/${storageKey}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }

  private async deleteStoredFile(storageKey: string) {
    try {
      await unlink(join(UPLOADS_ROOT, storageKey));
    } catch {
      // File may already be removed from disk.
    }
  }

  private async deleteImageRecord(imageId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return;
    }

    await this.deleteStoredFile(image.storageKey);
    await this.prisma.image.delete({ where: { id: imageId } });
  }

  private async assertOrgAdmin(
    organizationId: string,
    userId: number,
    requesterRole?: Role,
  ) {
    if (requesterRole === Role.SUPERADMIN) {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId },
        select: { id: true },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
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

    if (!membership || !ADMIN_ROLES.includes(membership.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return membership;
  }

  private async assertProductAdmin(organizationId: string, userId: number) {
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
        'Only the business admin can manage product images',
      );
    }

    return membership;
  }

  private async createImageRecord(
    file: Express.Multer.File,
    type: ImageType,
    uploadedById: number,
    storageKey: string,
    productId?: string,
  ) {
    return this.prisma.image.create({
      data: {
        url: this.buildPublicUrl(storageKey),
        storageKey,
        mimeType: file.mimetype,
        size: file.size,
        type,
        uploadedById,
        productId,
      },
    });
  }

  private resolveStorageKey(
    file: Express.Multer.File,
    subdir: 'avatars' | 'logos' | 'products',
  ) {
    return `${subdir}/${file.filename}`;
  }

  async uploadAvatar(file: Express.Multer.File, userId: number) {
    const storageKey = this.resolveStorageKey(file, 'avatars');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const image = await this.createImageRecord(
      file,
      ImageType.AVATAR,
      userId,
      storageKey,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarId: image.id },
    });

    if (user.avatarId) {
      await this.deleteImageRecord(user.avatarId);
    }

    return {
      message: 'Avatar uploaded successfully',
      image,
    };
  }

  async uploadOrganizationLogo(
    organizationId: string,
    file: Express.Multer.File,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertOrgAdmin(organizationId, userId, requesterRole);

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { logoId: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const storageKey = this.resolveStorageKey(file, 'logos');
    const image = await this.createImageRecord(
      file,
      ImageType.LOGO,
      userId,
      storageKey,
    );

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { logoId: image.id },
    });

    if (organization.logoId) {
      await this.deleteImageRecord(organization.logoId);
    }

    return {
      message: 'Organization logo uploaded successfully',
      image,
    };
  }

  async uploadProductImage(
    organizationId: string,
    productId: string,
    file: Express.Multer.File,
    userId: number,
    requesterRole: Role,
    alt?: string,
  ) {
    await this.assertProductAdmin(organizationId, userId);

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found in this organization');
    }

    const storageKey = this.resolveStorageKey(file, 'products');
    const image = await this.createImageRecord(
      file,
      ImageType.PRODUCT,
      userId,
      storageKey,
      productId,
    );

    if (alt) {
      await this.prisma.image.update({
        where: { id: image.id },
        data: { alt },
      });
      image.alt = alt;
    }

    return {
      message: 'Product image uploaded successfully',
      image,
    };
  }

  async deleteProductImage(
    organizationId: string,
    productId: string,
    imageId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertProductAdmin(organizationId, userId);

    const image = await this.prisma.image.findFirst({
      where: {
        id: imageId,
        productId,
        product: { organizationId },
      },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    await this.deleteImageRecord(imageId);

    return {
      message: 'Product image deleted successfully',
    };
  }
}
