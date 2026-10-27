import { Controller, Get, Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ContentModule } from './content/content.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { InquiriesModule } from './inquiries/inquiries.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { ProductsModule } from './products/products.module.js';
import { RevalidateModule } from './revalidate/revalidate.service.js';
import { StatsModule } from './stats/stats.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { UsersModule } from './users/users.module.js';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';

@Controller()
class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Dùng cho Docker/giám sát: kiểm tra API chạy và kết nối được database. */
  @Get('health')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', time: new Date().toISOString() };
  }
}

@Module({
  imports: [
    // Sentry: gắn bộ bắt lỗi (chỉ hoạt động khi có SENTRY_DSN, xem src/instrument.ts).
    SentryModule.forRoot(),
    PrismaModule,
    RealtimeModule,
    RevalidateModule,
    AuthModule,
    AuditModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ContentModule,
    OrdersModule,
    InquiriesModule,
    CommentsModule,
    UploadsModule,
    StatsModule,
  ],
  controllers: [HealthController],
  // Lỗi không lường trước (5xx) → gửi Sentry rồi trả lời như bình thường; lỗi 4xx (sai dữ liệu, chưa đăng nhập…) không gửi.
  providers: [{ provide: APP_FILTER, useClass: SentryGlobalFilter }],
})
export class AppModule {}
