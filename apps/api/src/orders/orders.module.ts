import { Body, Controller, Get, HttpCode, Module, Param, Patch, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Auth, CurrentUser, Permission, type RequestUser } from '../auth/auth.guard.js';
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
@Permission('orders')
export class AdminOrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  list(@Query() query: AdminOrderQuery) {
    return this.service.list(query);
  }

  /** Tải file Excel theo bộ lọc đang xem. Đặt trước ':id' để "export" không bị hiểu là mã đơn. */
  @Get('export')
  @RateLimit(10, 60)
  async export(@Query() query: AdminOrderQuery, @Res() res: Response) {
    const { buffer, fileName } = await this.service.exportExcel(query);
    res
      .set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      })
      .send(buffer);
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
