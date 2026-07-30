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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { JwtPayload } from '../auth/interfaces/jwt.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { Roles } from '../../decorators/role-decorator';
import { CurrentUser } from '../../decorators/user-decorators';
import { CreateOrganizationDto } from './dto/org-dto';
import { UpdateOrganizationDto } from './dto/update-org-dto';
import { AddMemberDto, UpdateMemberDto } from './dto/member-dto';
import { AssignAdminDto } from './dto/assign-admin-dto';
import { OrganizationService } from './organization.service';

@ApiTags('Organizations')
@ApiBearerAuth('access-token')
@Controller('org')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationService,
  ) {}

  @Post()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Create a business (SUPERADMIN only)',
    description:
      'Optionally assign an existing user as owner/admin via adminEmail',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created; optional admin promoted to ADMIN',
  })
  create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({
    summary:
      'List businesses — all for SUPERADMIN, memberships for everyone else',
  })
  findMyOrganizations(@CurrentUser() user: JwtPayload) {
    return this.organizationsService.findMyOrganizations(user.sub, user.role);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiParam({ name: 'slug', example: 'acme-corp' })
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.findBySlug(slug, user.sub, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.organizationsService.findOne(id, user.sub, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization (OWNER/ADMIN or SUPERADMIN)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.update(id, dto, user.sub, user.role);
  }

  @Post(':id/assign-admin')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Hand business to an admin by email (SUPERADMIN only)',
    description:
      'Promotes the user to platform ADMIN and transfers organization ownership',
  })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  assignAdmin(
    @Param('id') id: string,
    @Body() dto: AssignAdminDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.assignAdmin(id, dto.email, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization (OWNER or SUPERADMIN)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.organizationsService.remove(id, user.sub, user.role);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List organization members' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  listMembers(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.organizationsService.listMembers(id, user.sub, user.role);
  }

  @Post(':id/members')
  @ApiOperation({
    summary:
      'Add member by email — SUPERADMIN can assign ADMIN; admin can only add MEMBER',
  })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.addMember(id, dto, user.sub, user.role);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Update member role' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'memberId', description: 'Member record ID' })
  updateMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.updateMember(
      id,
      memberId,
      dto,
      user.sub,
      user.role,
    );
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove member' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'memberId', description: 'Member record ID' })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.removeMember(
      id,
      memberId,
      user.sub,
      user.role,
    );
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave organization (non-owners only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  leaveOrganization(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.leaveOrganization(id, user.sub);
  }
}
