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
import { CreateTeamDto } from './dto/team-dto';
import { UpdateTeamDto } from './dto/update-team-dto';
import { AddTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member-dto';
import { TeamService } from './team.service';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller('organizations/:orgId/teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a team in an organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  create(
    @Param('orgId') orgId: string,
    @Body() dto: CreateTeamDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.create(orgId, dto, user.sub, user.role);
  }

  @Get()
  @ApiOperation({ summary: 'List all teams in an organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  findAll(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    return this.teamService.findAll(orgId, user.sub, user.role);
  }

  @Get(':teamId')
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  findOne(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.findOne(orgId, teamId, user.sub, user.role);
  }

  @Patch(':teamId')
  @ApiOperation({ summary: 'Update team' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  update(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.update(orgId, teamId, dto, user.sub, user.role);
  }

  @Delete(':teamId')
  @ApiOperation({ summary: 'Delete team' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  remove(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.remove(orgId, teamId, user.sub, user.role);
  }

  @Post(':teamId/members')
  @ApiOperation({ summary: 'Add user to team by userId or email' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  addMember(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Body() dto: AddTeamMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.addMember(
      orgId,
      teamId,
      dto,
      user.sub,
      user.role,
    );
  }

  @Patch(':teamId/members/:memberId')
  @ApiOperation({ summary: 'Update team member role' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @ApiParam({ name: 'memberId', description: 'Team member record ID' })
  updateMember(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.updateMember(
      orgId,
      teamId,
      memberId,
      dto,
      user.sub,
      user.role,
    );
  }

  @Delete(':teamId/members/:memberId')
  @ApiOperation({ summary: 'Remove user from team' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @ApiParam({ name: 'memberId', description: 'Team member record ID' })
  removeMember(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teamService.removeMember(
      orgId,
      teamId,
      memberId,
      user.sub,
      user.role,
    );
  }
}
