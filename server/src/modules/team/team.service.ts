import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRole, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/team-dto';
import { UpdateTeamDto } from './dto/update-team-dto';
import { AddTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member-dto';

const TEAM_MANAGER_ROLES: OrganizationRole[] = ['OWNER', 'ADMIN', 'MANAGER'];

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOrgExists(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  private async assertOrgMember(organizationId: string, userId: number) {
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

  private async assertCanAccess(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    if (requesterRole === Role.SUPERADMIN) {
      return this.assertOrgExists(organizationId);
    }

    return this.assertOrgMember(organizationId, userId);
  }

  private async assertTeamManager(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    if (requesterRole === Role.SUPERADMIN) {
      return this.assertOrgExists(organizationId);
    }

    const membership = await this.assertOrgMember(organizationId, userId);

    if (!TEAM_MANAGER_ROLES.includes(membership.role)) {
      throw new ForbiddenException(
        'You do not have permission to manage teams',
      );
    }

    return membership;
  }

  async create(
    organizationId: string,
    dto: CreateTeamDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertTeamManager(organizationId, userId, requesterRole);

    const existing = await this.prisma.team.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug: dto.slug,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Team slug already exists in this organization',
      );
    }

    return this.prisma.team.create({
      data: {
        ...dto,
        organizationId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async findAll(
    organizationId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    return this.prisma.team.findMany({
      where: { organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(
    organizationId: string,
    teamId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertCanAccess(organizationId, userId, requesterRole);

    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async update(
    organizationId: string,
    teamId: string,
    dto: UpdateTeamDto,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertTeamManager(organizationId, userId, requesterRole);
    await this.findOne(organizationId, teamId, userId, requesterRole);

    return this.prisma.team.update({
      where: { id: teamId },
      data: dto,
    });
  }

  async remove(
    organizationId: string,
    teamId: string,
    userId: number,
    requesterRole: Role,
  ) {
    await this.assertTeamManager(organizationId, userId, requesterRole);
    await this.findOne(organizationId, teamId, userId, requesterRole);

    await this.prisma.team.delete({ where: { id: teamId } });

    return { message: 'Team deleted successfully' };
  }

  async addMember(
    organizationId: string,
    teamId: string,
    dto: AddTeamMemberDto,
    requesterId: number,
    requesterRole: Role,
  ) {
    await this.assertTeamManager(organizationId, requesterId, requesterRole);
    await this.findOne(organizationId, teamId, requesterId, requesterRole);

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

    const orgMember = await this.prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },
    });

    if (!orgMember) {
      throw new NotFoundException('User is not a member of this organization');
    }

    const existing = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already on this team');
    }

    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId: targetUserId,
        role: dto.role ?? 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async updateMember(
    organizationId: string,
    teamId: string,
    teamMemberId: string,
    dto: UpdateTeamMemberDto,
    requesterId: number,
    requesterRole: Role,
  ) {
    await this.assertTeamManager(organizationId, requesterId, requesterRole);

    const teamMember = await this.prisma.teamMember.findFirst({
      where: { id: teamMemberId, teamId },
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    return this.prisma.teamMember.update({
      where: { id: teamMemberId },
      data: { role: dto.role },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async removeMember(
    organizationId: string,
    teamId: string,
    teamMemberId: string,
    requesterId: number,
    requesterRole: Role,
  ) {
    await this.assertTeamManager(organizationId, requesterId, requesterRole);

    const teamMember = await this.prisma.teamMember.findFirst({
      where: { id: teamMemberId, teamId },
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    await this.prisma.teamMember.delete({ where: { id: teamMemberId } });

    return { message: 'Team member removed successfully' };
  }
}
