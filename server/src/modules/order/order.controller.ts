import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { CurrentUser } from '../../decorators/user-decorators';
import type { JwtPayload } from '../auth/interfaces/jwt.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Place an order from cart items' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    return this.orderService.createOrder(user.sub, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'List shop orders for the logged-in user' })
  listMine(@CurrentUser() user: JwtPayload) {
    return this.orderService.listMyOrders(user.sub);
  }
}
