import { Body, Controller, Get, HttpCode, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { Auth, CurrentUser, type RequestUser } from '../auth/auth.guard.js';
import { RateLimit } from '../common/rate-limit.guard.js';
import { AdminOrderQuery, CreateOrderDto, LookupOrderQuery, QuoteDto, UpdateOrderDto } from './orders.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class PublicOrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('quote')
  @HttpCode(200)
  @RateLimit(60, 60)
  quote(@Body() dto: QuoteDto) {
    return this.service.quote(dto.items);
  }

  @Post()
  @RateLimit(5, 600)
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Get('lookup')
  @RateLimit(20, 60)
  lookup(@Query() query: LookupOrderQuery) {
    return this.service.lookup(query);
  }
}

@Controller('admin/orders')
@Auth()
export class AdminOrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  list(@Query() query: AdminOrderQuery) {
    return this.service.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto, @CurrentUser() user: RequestUser) {
    return this.service.update(id, dto, user.id);
  }
}

@Module({
  controllers: [PublicOrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
