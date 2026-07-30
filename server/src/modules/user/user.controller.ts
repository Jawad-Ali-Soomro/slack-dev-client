import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { JwtPayload } from '../auth/interfaces/jwt.interface';
import { CurrentUser } from '../../decorators/user-decorators';
import { Roles } from '../../decorators/role-decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'List all platform users (SUPERADMIN only)' })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.userService.listUsers(query);
  }

  @Patch('users/:id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Update user role, status, or verification (SUPERADMIN only)',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.updateUser(id, dto, user.sub);
  }

  @Get('customers')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({
    summary:
      'List customers from bookings — scoped to managed organizations for ADMIN',
  })
  listCustomers(
    @Query() query: ListCustomersQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.listCustomers(user.sub, user.role, query);
  }
}
