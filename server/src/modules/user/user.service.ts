import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRole, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const ORG_ADMIN_ROLES: OrganizationRole[] = ['OWNER', 'ADMIN'];

const userSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  status: true,
  emailVerified: true,
  emailVerifiedAt: true,
  createdAt: true,
  avatar: {
    select: {
      url: true,
    },
  },
  _count: {
    select: {
      bookings: true,
      memberships: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeUser(user: {
    id: number;
    username: string;
    email: string;
    role: Role;
    status: string;
    emailVerified: boolean;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    avatar?: { url: string } | null;
    _count?: {
      bookings: number;
      memberships: number;
    };
  }) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      avatar: user.avatar ?? null,
      bookingCount: user._count?.bookings ?? 0,
      organizationCount: user._count?.memberships ?? 0,
    };
  }

  async listUsers(query: ListUsersQueryDto) {
    const where: Prisma.UserWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { username: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.serializeUser(user));
  }

  async updateUser(userId: number, dto: UpdateUserDto, requesterId: number) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (existing.role === Role.SUPERADMIN) {
      throw new ForbiddenException('Superadmin accounts cannot be modified');
    }

    if (userId === requesterId && dto.status === 'suspended') {
      throw new BadRequestException('You cannot suspend your own account');
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.role !== undefined) {
      data.role = dto.role;
    }

    if (dto.emailVerified !== undefined) {
      data.emailVerified = dto.emailVerified;
      data.emailVerifiedAt = dto.emailVerified ? new Date() : null;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: userSelect,
    });

    if (dto.status === 'suspended') {
      await this.prisma.session.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    return this.serializeUser(user);
  }

  private async getAccessibleOrgIds(
    userId: number,
    requesterRole: Role,
    orgId?: string,
  ) {
    let orgIds: string[];

    if (requesterRole === Role.SUPERADMIN) {
      if (orgId) {
        await this.assertOrgExists(orgId);
        orgIds = [orgId];
      } else {
        const orgs = await this.prisma.organization.findMany({
          select: { id: true },
        });
        orgIds = orgs.map((org) => org.id);
      }
    } else if (requesterRole === Role.ADMIN) {
      const memberships = await this.prisma.member.findMany({
        where: {
          userId,
          role: { in: ORG_ADMIN_ROLES },
        },
        select: { organizationId: true },
      });

      orgIds = memberships.map((membership) => membership.organizationId);

      if (orgId) {
        if (!orgIds.includes(orgId)) {
          throw new ForbiddenException(
            'You do not have access to this organization',
          );
        }
        orgIds = [orgId];
      }
    } else {
      throw new ForbiddenException('You do not have permission to list customers');
    }

    return orgIds;
  }

  private async assertOrgExists(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
  }

  async listCustomers(
    userId: number,
    requesterRole: Role,
    query: ListCustomersQueryDto,
  ) {
    const orgIds = await this.getAccessibleOrgIds(
      userId,
      requesterRole,
      query.orgId,
    );

    if (orgIds.length === 0) {
      return [];
    }

    const bookings = await this.prisma.booking.findMany({
      where: { organizationId: { in: orgIds } },
      include: {
        user: {
          select: userSelect,
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const customerMap = new Map<
      string,
      {
        key: string;
        id: number | null;
        username: string | null;
        email: string;
        guestName: string | null;
        role: string | null;
        status: string | null;
        emailVerified: boolean | null;
        createdAt: string | null;
        avatar: { url: string } | null;
        isGuest: boolean;
        bookingCount: number;
        lastBookingAt: string;
        organizations: Map<string, { id: string; name: string }>;
      }
    >();

    for (const booking of bookings) {
      const key = booking.userId
        ? `user:${booking.userId}`
        : `guest:${booking.guestEmail.toLowerCase()}`;

      const existing = customerMap.get(key);

      if (existing) {
        existing.bookingCount += 1;
        existing.organizations.set(booking.organization.id, booking.organization);
        continue;
      }

      customerMap.set(key, {
        key,
        id: booking.user?.id ?? null,
        username: booking.user?.username ?? null,
        email: booking.user?.email ?? booking.guestEmail,
        guestName: booking.user ? null : booking.guestName,
        role: booking.user?.role ?? null,
        status: booking.user?.status ?? null,
        emailVerified: booking.user?.emailVerified ?? null,
        createdAt: booking.user?.createdAt.toISOString() ?? null,
        avatar: booking.user?.avatar ?? null,
        isGuest: !booking.userId,
        bookingCount: 1,
        lastBookingAt: booking.createdAt.toISOString(),
        organizations: new Map([[booking.organization.id, booking.organization]]),
      });
    }

    let customers = Array.from(customerMap.values()).map((customer) => ({
      id: customer.id,
      username: customer.username,
      email: customer.email,
      guestName: customer.guestName,
      role: customer.role,
      status: customer.status,
      emailVerified: customer.emailVerified,
      createdAt: customer.createdAt,
      avatar: customer.avatar,
      isGuest: customer.isGuest,
      bookingCount: customer.bookingCount,
      lastBookingAt: customer.lastBookingAt,
      organizations: Array.from(customer.organizations.values()),
    }));

    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase();
      customers = customers.filter((customer) => {
        const haystack = [
          customer.username,
          customer.email,
          customer.guestName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(term);
      });
    }

    customers.sort(
      (a, b) =>
        new Date(b.lastBookingAt).getTime() - new Date(a.lastBookingAt).getTime(),
    );

    return customers;
  }
}
