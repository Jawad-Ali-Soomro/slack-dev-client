import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRole, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/org-dto';
import { UpdateOrganizationDto } from './dto/update-org-dto';
import { AddMemberDto, UpdateMemberDto } from './dto/member-dto';

const ORG_ADMIN_ROLES: OrganizationRole[] = ['OWNER', 'ADMIN'];
const ADMIN_ASSIGNABLE_ROLES: OrganizationRole[] = [
  'MEMBER',
  'MANAGER',
  'GUEST',
];
const LODGING_BUSINESS_TYPES = new Set([
  'hotel-management',
  'hostel-management',
]);

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  private async getMembership(organizationId: string, userId: number) {
    return this.prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  private async assertOrgExists(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  private async assertMember(organizationId: string, userId: number) {
    const membership = await this.getMembership(organizationId, userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    return membership;
  }

  private async assertCanAccess(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    if (requesterRole === Role.SUPERADMIN) {
      return this.assertOrgExists(organizationId);
    }

    return this.assertMember(organizationId, userId);
  }

  private async assertCanManageMembers(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    if (requesterRole === Role.SUPERADMIN) {
      return this.assertOrgExists(organizationId);
    }

    const membership = await this.assertMember(organizationId, userId);
    if (!ORG_ADMIN_ROLES.includes(membership.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
    return membership;
  }

  private assertCanAssignRole(
    requesterRole: Role,
    role: OrganizationRole,
  ) {
    if (requesterRole === Role.SUPERADMIN) {
      return;
    }

    if (role === 'ADMIN' || role === 'OWNER') {
      throw new ForbiddenException(
        'Only superadmin can assign admin or owner roles',
      );
    }

    if (!ADMIN_ASSIGNABLE_ROLES.includes(role)) {
      throw new ForbiddenException('Admins can only add members');
    }
  }

  private async promotePlatformAdmin(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.SUPERADMIN) {
      return user;
    }

    if (user.role !== Role.ADMIN) {
      return this.prisma.user.update({
        where: { id: userId },
        data: { role: Role.ADMIN },
      });
    }

    return user;
  }

  private assertLodgingLocation(
    businessType: string | null | undefined,
    city?: string | null,
    country?: string | null,
  ) {
    if (!LODGING_BUSINESS_TYPES.has(businessType ?? '')) {
      return;
    }

    if (!city?.trim()) {
      throw new BadRequestException(
        'City is required for hotel and hostel businesses',
      );
    }

    if (!country?.trim()) {
      throw new BadRequestException(
        'Country is required for hotel and hostel businesses',
      );
    }
  }

  async create(dto: CreateOrganizationDto, requesterId: number) {
    const { adminEmail, ...orgData } = dto;
    this.assertLodgingLocation(orgData.businessType, orgData.city, orgData.country);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.organization.findUnique({
        where: { slug: orgData.slug },
      });

      if (existing) {
        throw new ConflictException('Organization slug already exists');
      }

      let ownerId = requesterId;
      let adminUser: { id: number } | null = null;

      if (adminEmail) {
        adminUser = await tx.user.findUnique({
          where: { email: adminEmail },
          select: { id: true },
        });

        if (!adminUser) {
          throw new NotFoundException('User with that email not found');
        }

        ownerId = adminUser.id;
      }

      const organization = await tx.organization.create({
        data: {
          ...orgData,
          ownerId,
        },
      });

      await tx.member.create({
        data: {
          organizationId: organization.id,
          userId: ownerId,
          role: 'OWNER',
        },
      });

      if (adminUser) {
        await tx.user.update({
          where: { id: adminUser.id },
          data: { role: Role.ADMIN },
        });
      }

      return tx.organization.findUnique({
        where: { id: organization.id },
        include: {
          logo: {
            select: {
              id: true,
              url: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: { members: true, teams: true },
          },
        },
      });
    });
  }

  private readonly organizationLogoSelect = {
    id: true,
    url: true,
  } as const;

  async findMyOrganizations(userId: number, requesterRole: Role) {
    if (requesterRole === Role.SUPERADMIN) {
      return this.prisma.organization.findMany({
        include: {
          logo: {
            select: this.organizationLogoSelect,
          },
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
          members: {
            where: { role: { in: ['OWNER', 'ADMIN'] } },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: { members: true, teams: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const memberships = await this.prisma.member.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            logo: {
              select: this.organizationLogoSelect,
            },
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
              },
            },
            _count: {
              select: { members: true, teams: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((membership) => ({
      ...membership.organization,
      myRole: membership.role,
    }));
  }

  async findOne(id: string, userId: number, requesterRole: Role) {
    await this.assertCanAccess(id, userId, requesterRole);

    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        logo: {
          select: this.organizationLogoSelect,
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                avatar: {
                  select: { id: true, url: true },
                },
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                    avatar: {
                      select: { id: true, url: true },
                    },
                  },
                },
              },
            },
            _count: {
              select: { members: true },
            },
          },
        },
        _count: {
          select: { members: true, teams: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership =
      requesterRole === Role.SUPERADMIN
        ? null
        : await this.prisma.member.findUnique({
            where: {
              organizationId_userId: {
                organizationId: id,
                userId,
              },
            },
            select: { role: true },
          });

    return {
      ...organization,
      myRole: membership?.role ?? null,
    };
  }

  async findBySlug(slug: string, userId: number, requesterRole: Role) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.findOne(organization.id, userId, requesterRole);
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanManageMembers(id, userId, requesterRole);

    const { adminEmail: _adminEmail, ...data } = dto as UpdateOrganizationDto & {
      adminEmail?: string;
    };

    const existing = await this.prisma.organization.findUnique({
      where: { id },
      select: { businessType: true, city: true, country: true },
    });

    if (!existing) {
      throw new NotFoundException('Organization not found');
    }

    const nextType = data.businessType ?? existing.businessType;
    this.assertLodgingLocation(
      nextType,
      data.city !== undefined ? data.city : existing.city,
      data.country !== undefined ? data.country : existing.country,
    );

    await this.prisma.organization.update({
      where: { id },
      data,
    });

    return this.findOne(id, userId, requesterRole);
  }

  async assignAdmin(
    organizationId: string,
    email: string,
    requesterRole: Role,
  ) {
    if (requesterRole !== Role.SUPERADMIN) {
      throw new ForbiddenException('Only superadmin can assign business admins');
    }

    await this.assertOrgExists(organizationId);

    const adminUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!adminUser) {
      throw new NotFoundException('User with that email not found');
    }

    await this.promotePlatformAdmin(adminUser.id);

    return this.prisma.$transaction(async (tx) => {
      const owners = await tx.member.findMany({
        where: {
          organizationId,
          role: 'OWNER',
        },
        include: {
          user: {
            select: {
              id: true,
              role: true,
            },
          },
        },
      });

      for (const owner of owners) {
        if (owner.userId === adminUser.id) {
          continue;
        }

        if (owner.user.role === Role.SUPERADMIN) {
          await tx.member.delete({ where: { id: owner.id } });
        } else {
          await tx.member.update({
            where: { id: owner.id },
            data: { role: 'ADMIN' },
          });
        }
      }

      const existing = await tx.member.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: adminUser.id,
          },
        },
      });

      if (existing) {
        await tx.member.update({
          where: { id: existing.id },
          data: { role: 'OWNER' },
        });
      } else {
        await tx.member.create({
          data: {
            organizationId,
            userId: adminUser.id,
            role: 'OWNER',
          },
        });
      }

      await tx.organization.update({
        where: { id: organizationId },
        data: { ownerId: adminUser.id },
      });

      return tx.organization.findUnique({
        where: { id: organizationId },
        include: {
          logo: {
            select: this.organizationLogoSelect,
          },
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
          members: {
            where: { role: { in: ['OWNER', 'ADMIN'] } },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: { members: true, teams: true },
          },
        },
      });
    });
  }

  async remove(id: string, userId: number, requesterRole: Role) {
    if (requesterRole === Role.SUPERADMIN) {
      await this.assertOrgExists(id);
    } else {
      const membership = await this.assertMember(id, userId);
      if (membership.role !== 'OWNER') {
        throw new ForbiddenException(
          'Only the owner can delete the organization',
        );
      }
    }

    await this.prisma.organization.delete({ where: { id } });
    return { message: 'Organization deleted successfully' };
  }

  async listMembers(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    return this.prisma.member.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addMember(
    organizationId: string,
    dto: AddMemberDto,
    requesterId: number,
    requesterRole: Role,
  ) {
    await this.assertCanManageMembers(
      organizationId,
      requesterId,
      requesterRole,
    );

    const role = dto.role ?? OrganizationRole.MEMBER;
    this.assertCanAssignRole(requesterRole, role);

    if (requesterRole !== Role.SUPERADMIN && role !== OrganizationRole.MEMBER) {
      throw new ForbiddenException('Admins can only add members');
    }

    let targetUserId = dto.userId;

    if (!targetUserId && dto.email) {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (!user) {
        throw new NotFoundException('User with that email not found');
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      throw new NotFoundException('Provide userId or email');
    }

    const existing = await this.getMembership(organizationId, targetUserId);
    if (existing) {
      throw new ConflictException('User is already a member');
    }

    if (role === OrganizationRole.ADMIN || role === OrganizationRole.OWNER) {
      await this.promotePlatformAdmin(targetUserId);
    }

    return this.prisma.member.create({
      data: {
        organizationId,
        userId: targetUserId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async updateMember(
    organizationId: string,
    memberId: string,
    dto: UpdateMemberDto,
    requesterId: number,
    requesterRole: Role,
  ) {
    const requester = await this.assertCanManageMembers(
      organizationId,
      requesterId,
      requesterRole,
    );

    this.assertCanAssignRole(requesterRole, dto.role);

    if (
      requesterRole !== Role.SUPERADMIN &&
      dto.role !== OrganizationRole.MEMBER
    ) {
      throw new ForbiddenException('Admins can only assign the member role');
    }

    const member = await this.prisma.member.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (
      requesterRole !== Role.SUPERADMIN &&
      typeof requester === 'object' &&
      'role' in requester
    ) {
      if (member.role === 'OWNER' && requester.role !== 'OWNER') {
        throw new ForbiddenException('Only the owner can change owner role');
      }

      if (dto.role === 'OWNER' && requester.role !== 'OWNER') {
        throw new ForbiddenException('Only the owner can assign owner role');
      }
    }

    if (dto.role === OrganizationRole.ADMIN || dto.role === OrganizationRole.OWNER) {
      await this.promotePlatformAdmin(member.userId);
    }

    return this.prisma.member.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async removeMember(
    organizationId: string,
    memberId: string,
    requesterId: number,
    requesterRole: Role,
  ) {
    const requester = await this.assertCanManageMembers(
      organizationId,
      requesterId,
      requesterRole,
    );

    const member = await this.prisma.member.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove the organization owner');
    }

    if (
      requesterRole !== Role.SUPERADMIN &&
      member.userId === requesterId &&
      typeof requester === 'object' &&
      'role' in requester &&
      requester.role !== 'OWNER'
    ) {
      throw new ForbiddenException('Use leave endpoint to remove yourself');
    }

    await this.prisma.member.delete({ where: { id: memberId } });

    return { message: 'Member removed successfully' };
  }

  async leaveOrganization(organizationId: string, userId: number) {
    const membership = await this.assertMember(organizationId, userId);

    if (membership.role === 'OWNER') {
      throw new ForbiddenException(
        'Owner cannot leave. Transfer ownership or delete the organization.',
      );
    }

    await this.prisma.member.delete({ where: { id: membership.id } });

    return { message: 'Left organization successfully' };
  }
}
