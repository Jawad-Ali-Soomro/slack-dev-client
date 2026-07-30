import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRole, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../common/pagination';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { BulkRoomStatusDto } from './dto/bulk-room-status.dto';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

const LODGING_TYPES = new Set(['hotel-management', 'hostel-management']);

@Injectable()
export class HotelService {
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

  private parseDateOnly(value: string, label: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) {
      throw new BadRequestException(`${label} must be YYYY-MM-DD`);
    }
    const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${label}`);
    }
    return date;
  }

  private nightsBetween(checkIn: Date, checkOut: Date) {
    const ms = checkOut.getTime() - checkIn.getTime();
    const nights = Math.round(ms / (24 * 60 * 60 * 1000));
    if (nights < 1) {
      throw new BadRequestException('checkOut must be after checkIn');
    }
    return nights;
  }

  private serializeRoom<T extends { price: number }>(room: T) {
    return {
      ...room,
      price: this.fromCents(room.price),
      priceCents: room.price,
    };
  }

  private serializeBooking<T extends { totalPrice: number }>(booking: T) {
    return {
      ...booking,
      totalPrice: this.fromCents(booking.totalPrice),
      totalPriceCents: booking.totalPrice,
    };
  }

  private async assertLodgingOrg(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        businessType: true,
        isActive: true,
        city: true,
        country: true,
        address: true,
        description: true,
        logo: { select: { id: true, url: true, alt: true } },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!LODGING_TYPES.has(organization.businessType ?? '')) {
      throw new BadRequestException(
        'Floors and rooms are only available for hotel or hostel organizations',
      );
    }

    return organization;
  }

  private async assertCanAccess(
    organizationId: string,
    userId: number,
    requesterRole?: Role,
  ) {
    await this.assertLodgingOrg(organizationId);

    if (requesterRole === Role.SUPERADMIN) {
      return;
    }

    const membership = await this.prisma.member.findUnique({
      where: {
        organizationId_userId: { organizationId, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }
  }

  private async assertManager(
    organizationId: string,
    userId: number,
    requesterRole?: Role,
  ) {
    await this.assertLodgingOrg(organizationId);

    if (requesterRole === Role.SUPERADMIN) {
      return;
    }

    const membership = await this.prisma.member.findUnique({
      where: {
        organizationId_userId: { organizationId, userId },
      },
    });

    if (
      !membership ||
      (membership.role !== OrganizationRole.OWNER &&
        membership.role !== OrganizationRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only organization OWNER or ADMIN can manage hotel rooms',
      );
    }
  }

  private async resolveLodgingOrg(orgIdOrSlug: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        isActive: true,
        businessType: { in: [...LODGING_TYPES] },
        OR: [{ id: orgIdOrSlug }, { slug: orgIdOrSlug }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        businessType: true,
        city: true,
        country: true,
        address: true,
        description: true,
        logo: { select: { id: true, url: true, alt: true } },
      },
    });

    if (!organization) {
      throw new NotFoundException('Hotel not found');
    }

    return organization;
  }

  private roomConflictWhere(checkIn: Date, checkOut: Date) {
    return {
      bookingRooms: {
        some: {
          booking: {
            status: { in: ['pending', 'confirmed'] },
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn },
          },
        },
      },
    };
  }

  private async createNotification(data: {
    userId: number;
    title: string;
    message: string;
    type: string;
    link?: string | null;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link ?? null,
      },
    });
  }

  // —— Floors ——

  async listFloors(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    const floors = await this.prisma.floor.findMany({
      where: { organizationId },
      include: {
        rooms: { orderBy: { number: 'asc' } },
        _count: { select: { rooms: true } },
      },
      orderBy: { level: 'asc' },
    });

    return floors.map((floor) => ({
      ...floor,
      rooms: floor.rooms.map((room) => this.serializeRoom(room)),
    }));
  }

  async createFloor(
    organizationId: string,
    dto: CreateFloorDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertManager(organizationId, userId, requesterRole);

    try {
      return await this.prisma.floor.create({
        data: {
          organizationId,
          name: dto.name.trim(),
          level: dto.level,
        },
        include: {
          rooms: true,
          _count: { select: { rooms: true } },
        },
      });
    } catch {
      throw new ConflictException(
        'A floor with this level already exists for this organization',
      );
    }
  }

  async updateFloor(
    organizationId: string,
    floorId: string,
    dto: UpdateFloorDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertManager(organizationId, userId, requesterRole);

    const existing = await this.prisma.floor.findFirst({
      where: { id: floorId, organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Floor not found');
    }

    try {
      return await this.prisma.floor.update({
        where: { id: floorId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.level !== undefined ? { level: dto.level } : {}),
        },
        include: {
          rooms: { orderBy: { number: 'asc' } },
          _count: { select: { rooms: true } },
        },
      });
    } catch {
      throw new ConflictException(
        'A floor with this level already exists for this organization',
      );
    }
  }

  async deleteFloor(
    organizationId: string,
    floorId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertManager(organizationId, userId, requesterRole);

    const existing = await this.prisma.floor.findFirst({
      where: { id: floorId, organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Floor not found');
    }

    await this.prisma.floor.delete({ where: { id: floorId } });
    return { message: 'Floor deleted successfully' };
  }

  // —— Rooms ——

  async listRooms(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    const rooms = await this.prisma.room.findMany({
      where: { organizationId },
      include: {
        floor: { select: { id: true, name: true, level: true } },
      },
      orderBy: [{ floor: { level: 'asc' } }, { number: 'asc' }],
    });

    return rooms.map((room) => this.serializeRoom(room));
  }

  async createRoom(
    organizationId: string,
    dto: CreateRoomDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertManager(organizationId, userId, requesterRole);

    const floor = await this.prisma.floor.findFirst({
      where: { id: dto.floorId, organizationId },
      select: { id: true },
    });

    if (!floor) {
      throw new NotFoundException('Floor not found in this organization');
    }

    try {
      const room = await this.prisma.room.create({
        data: {
          organizationId,
          floorId: dto.floorId,
          number: dto.number.trim(),
          label: dto.label?.trim() || null,
          roomType: dto.roomType.trim(),
          price: this.toCents(dto.price),
          capacity: dto.capacity ?? 2,
          status: dto.status ?? 'open',
          climate: dto.climate ?? 'ac',
          bathroom: dto.bathroom ?? 'private',
        },
        include: {
          floor: { select: { id: true, name: true, level: true } },
        },
      });
      return this.serializeRoom(room);
    } catch {
      throw new ConflictException(
        'A room with this number already exists for this organization',
      );
    }
  }

  async updateRoom(
    organizationId: string,
    roomId: string,
    dto: UpdateRoomDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertManager(organizationId, userId, requesterRole);

    const existing = await this.prisma.room.findFirst({
      where: { id: roomId, organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Room not found');
    }

    if (dto.floorId) {
      const floor = await this.prisma.floor.findFirst({
        where: { id: dto.floorId, organizationId },
        select: { id: true },
      });
      if (!floor) {
        throw new NotFoundException('Floor not found in this organization');
      }
    }

    try {
      const room = await this.prisma.room.update({
        where: { id: roomId },
        data: {
          ...(dto.floorId !== undefined ? { floorId: dto.floorId } : {}),
          ...(dto.number !== undefined ? { number: dto.number.trim() } : {}),
          ...(dto.label !== undefined
            ? { label: dto.label.trim() || null }
            : {}),
          ...(dto.roomType !== undefined
            ? { roomType: dto.roomType.trim() }
            : {}),
          ...(dto.price !== undefined ? { price: this.toCents(dto.price) } : {}),
          ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.climate !== undefined ? { climate: dto.climate } : {}),
          ...(dto.bathroom !== undefined ? { bathroom: dto.bathroom } : {}),
        },
        include: {
          floor: { select: { id: true, name: true, level: true } },
        },
      });
      return this.serializeRoom(room);
    } catch {
      throw new ConflictException(
        'A room with this number already exists for this organization',
      );
    }
  }

  async deleteRoom(
    organizationId: string,
    roomId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertManager(organizationId, userId, requesterRole);

    const existing = await this.prisma.room.findFirst({
      where: { id: roomId, organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Room not found');
    }

    await this.prisma.room.delete({ where: { id: roomId } });
    return { message: 'Room deleted successfully' };
  }

  async bulkUpdateRoomStatus(
    organizationId: string,
    dto: BulkRoomStatusDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertManager(organizationId, userId, requesterRole);

    const result = await this.prisma.room.updateMany({
      where: {
        organizationId,
        id: { in: dto.roomIds },
      },
      data: { status: dto.status },
    });

    return {
      message: `Updated ${result.count} room(s)`,
      updatedCount: result.count,
      status: dto.status,
    };
  }

  // —— Bookings (admin) ——

  async listBookings(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    const bookings = await this.prisma.booking.findMany({
      where: { organizationId },
      include: {
        rooms: {
          include: {
            room: {
              include: {
                floor: { select: { id: true, name: true, level: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((booking) =>
      this.serializeBooking({
        ...booking,
        rooms: booking.rooms.map((br) => ({
          ...br,
          room: this.serializeRoom(br.room),
        })),
      }),
    );
  }

  async updateBooking(
    organizationId: string,
    bookingId: string,
    dto: UpdateBookingDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertManager(organizationId, userId, requesterRole);

    const existing = await this.prisma.booking.findFirst({
      where: { id: bookingId, organizationId },
      select: {
        id: true,
        status: true,
        userId: true,
        guestName: true,
        checkIn: true,
        checkOut: true,
        organization: { select: { name: true, slug: true } },
        rooms: { include: { room: { select: { number: true } } } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Booking not found');
    }

    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: {
        rooms: {
          include: {
            room: {
              include: {
                floor: { select: { id: true, name: true, level: true } },
              },
            },
          },
        },
      },
    });

    if (
      dto.status &&
      dto.status !== existing.status &&
      existing.userId
    ) {
      const roomNumbers = existing.rooms
        .map((br) => br.room.number)
        .join(', ');
      const orgName = existing.organization.name;
      const checkInLabel = existing.checkIn.toISOString().slice(0, 10);
      const checkOutLabel = existing.checkOut.toISOString().slice(0, 10);

      if (dto.status === 'confirmed') {
        await this.createNotification({
          userId: existing.userId,
          title: 'Reservation confirmed',
          message: `Your reservation at ${orgName} for room(s) ${roomNumbers} (${checkInLabel} → ${checkOutLabel}) has been approved. Your room is now reserved.`,
          type: 'booking_confirmed',
          link: '/profile',
        });
      } else if (dto.status === 'cancelled') {
        await this.createNotification({
          userId: existing.userId,
          title: 'Reservation cancelled',
          message: `Your reservation at ${orgName} for room(s) ${roomNumbers} (${checkInLabel} → ${checkOutLabel}) has been cancelled.`,
          type: 'booking_cancelled',
          link: '/profile',
        });
      }
    }

    return this.serializeBooking({
      ...booking,
      rooms: booking.rooms.map((br) => ({
        ...br,
        room: this.serializeRoom(br.room),
      })),
    });
  }

  // —— Public catalog ——

  async listPublicHotels(options?: {
    businessType?: string;
    q?: string;
    city?: string;
    country?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const type = options?.businessType?.trim();
    if (type && !LODGING_TYPES.has(type)) {
      throw new BadRequestException(
        'businessType must be hotel-management or hostel-management',
      );
    }

    const query = options?.q?.trim() || undefined;
    const city = options?.city?.trim() || undefined;
    const country = options?.country?.trim() || undefined;
    const sort = options?.sort?.trim() || 'name';

    const where: Prisma.OrganizationWhereInput = {
      isActive: true,
      businessType: type ? type : { in: [...LODGING_TYPES] },
      ...(city
        ? { city: { equals: city, mode: 'insensitive' as const } }
        : {}),
      ...(country
        ? { country: { equals: country, mode: 'insensitive' as const } }
        : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { city: { contains: query, mode: 'insensitive' as const } },
              { country: { contains: query, mode: 'insensitive' as const } },
              {
                description: {
                  contains: query,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const { skip, take, page, limit } = this.pagination.getPage({
      page: options?.page,
      limit: options?.limit,
    });

    const [total, orgs] = await Promise.all([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          businessType: true,
          city: true,
          country: true,
          description: true,
          logo: { select: { id: true, url: true, alt: true } },
          _count: {
            select: {
              rooms: true,
              floors: true,
            },
          },
          rooms: {
            where: { status: 'open' },
            select: { id: true },
          },
        },
        orderBy:
          sort === 'newest'
            ? { createdAt: 'desc' }
            : { name: 'asc' },
        skip,
        take,
      }),
    ]);

    const items = orgs.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      businessType: org.businessType,
      city: org.city,
      country: org.country,
      description: org.description,
      logo: org.logo,
      floorCount: org._count.floors,
      roomCount: org._count.rooms,
      openRoomCount: org.rooms.length,
    }));

    return this.pagination.buildResult(items, total, page, limit);
  }

  async getPublicHotelFilters(businessType?: string) {
    const type = businessType?.trim();
    if (type && !LODGING_TYPES.has(type)) {
      throw new BadRequestException(
        'businessType must be hotel-management or hostel-management',
      );
    }

    const where: Prisma.OrganizationWhereInput = {
      isActive: true,
      businessType: type ? type : { in: [...LODGING_TYPES] },
    };

    const orgs = await this.prisma.organization.findMany({
      where,
      select: { city: true, country: true },
    });

    const cities = [
      ...new Set(
        orgs.map((o) => o.city).filter((v): v is string => Boolean(v)),
      ),
    ].sort();
    const countries = [
      ...new Set(
        orgs.map((o) => o.country).filter((v): v is string => Boolean(v)),
      ),
    ].sort();

    return {
      cities,
      countries,
      sortOptions: ['name', 'newest'],
    };
  }

  async getPublicHotel(orgIdOrSlug: string) {
    const organization = await this.resolveLodgingOrg(orgIdOrSlug);

    const floors = await this.prisma.floor.findMany({
      where: { organizationId: organization.id },
      include: {
        rooms: { orderBy: { number: 'asc' } },
        _count: { select: { rooms: true } },
      },
      orderBy: { level: 'asc' },
    });

    return {
      ...organization,
      floors: floors.map((floor) => ({
        ...floor,
        rooms: floor.rooms.map((room) => this.serializeRoom(room)),
      })),
      floorCount: floors.length,
      roomCount: floors.reduce((sum, f) => sum + f.rooms.length, 0),
      openRoomCount: floors.reduce(
        (sum, f) => sum + f.rooms.filter((r) => r.status === 'open').length,
        0,
      ),
    };
  }

  async getAvailability(
    orgIdOrSlug: string,
    checkInStr: string,
    checkOutStr: string,
  ) {
    if (!checkInStr || !checkOutStr) {
      throw new BadRequestException('checkIn and checkOut are required');
    }

    const organization = await this.resolveLodgingOrg(orgIdOrSlug);
    const checkIn = this.parseDateOnly(checkInStr, 'checkIn');
    const checkOut = this.parseDateOnly(checkOutStr, 'checkOut');
    const nights = this.nightsBetween(checkIn, checkOut);

    const rooms = await this.prisma.room.findMany({
      where: {
        organizationId: organization.id,
        status: 'open',
      },
      include: {
        floor: { select: { id: true, name: true, level: true } },
        bookingRooms: {
          where: {
            booking: {
              status: { in: ['pending', 'confirmed'] },
              checkIn: { lt: checkOut },
              checkOut: { gt: checkIn },
            },
          },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: [{ floor: { level: 'asc' } }, { number: 'asc' }],
    });

    return {
      organizationId: organization.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      nights,
      rooms: rooms.map(({ bookingRooms, ...room }) => ({
        ...this.serializeRoom(room),
        reserved: bookingRooms.length > 0,
      })),
    };
  }

  async listMyBookings(userId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, businessType: true },
        },
        rooms: {
          include: {
            room: {
              include: {
                floor: { select: { id: true, name: true, level: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((booking) => {
      const nights = Math.max(
        1,
        Math.round(
          (booking.checkOut.getTime() - booking.checkIn.getTime()) /
            (24 * 60 * 60 * 1000),
        ),
      );
      return this.serializeBooking({
        ...booking,
        nights,
        organizationName: booking.organization.name,
        organizationSlug: booking.organization.slug,
        rooms: booking.rooms.map((br) => ({
          ...br,
          room: this.serializeRoom(br.room),
        })),
      });
    });
  }

  async createPublicBooking(
    orgIdOrSlug: string,
    dto: CreatePublicBookingDto,
    userId: number,
  ) {
    const organization = await this.resolveLodgingOrg(orgIdOrSlug);
    const checkIn = this.parseDateOnly(dto.checkIn, 'checkIn');
    const checkOut = this.parseDateOnly(dto.checkOut, 'checkOut');
    const nights = this.nightsBetween(checkIn, checkOut);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uniqueRoomIds = [...new Set(dto.roomIds)];

    const rooms = await this.prisma.room.findMany({
      where: {
        organizationId: organization.id,
        id: { in: uniqueRoomIds },
      },
    });

    if (rooms.length !== uniqueRoomIds.length) {
      throw new BadRequestException(
        'One or more rooms were not found for this hotel',
      );
    }

    const closed = rooms.filter((room) => room.status !== 'open');
    if (closed.length) {
      throw new BadRequestException(
        `Room(s) closed: ${closed.map((r) => r.number).join(', ')}`,
      );
    }

    const conflicting = await this.prisma.room.findMany({
      where: {
        id: { in: uniqueRoomIds },
        ...this.roomConflictWhere(checkIn, checkOut),
      },
      select: { number: true },
    });

    if (conflicting.length) {
      throw new ConflictException(
        `Room(s) already booked for these dates: ${conflicting
          .map((r) => r.number)
          .join(', ')}`,
      );
    }

    const totalPrice = rooms.reduce(
      (sum, room) => sum + room.price * nights,
      0,
    );

    const guestName =
      dto.guestName?.trim() || user.username || user.email.split('@')[0];
    const guestEmail =
      dto.guestEmail?.trim().toLowerCase() || user.email.toLowerCase();

    const booking = await this.prisma.booking.create({
      data: {
        organizationId: organization.id,
        checkIn,
        checkOut,
        guestName,
        guestEmail,
        guestPhone: dto.guestPhone?.trim() || null,
        status: 'pending',
        totalPrice,
        userId: user.id,
        rooms: {
          create: uniqueRoomIds.map((roomId) => ({ roomId })),
        },
      },
      include: {
        rooms: {
          include: {
            room: {
              include: {
                floor: { select: { id: true, name: true, level: true } },
              },
            },
          },
        },
      },
    });

    const roomNumbers = booking.rooms.map((br) => br.room.number).join(', ');
    await this.createNotification({
      userId: user.id,
      title: 'Reservation requested',
      message: `Your reservation request at ${organization.name} for room(s) ${roomNumbers} is pending owner approval.`,
      type: 'booking_pending',
      link: '/profile',
    });

    return this.serializeBooking({
      ...booking,
      nights,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      rooms: booking.rooms.map((br) => ({
        ...br,
        room: this.serializeRoom(br.room),
      })),
    });
  }
}
