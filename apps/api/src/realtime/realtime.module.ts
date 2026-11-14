import { Controller, Global, Injectable, Module, Sse, type MessageEvent } from '@nestjs/common';
import type { AdminRealtimeEvent, PublicRealtimeEvent } from '@frozen-fruit-shop/types';
import { Subject, filter, from, interval, map, merge, mergeMap, takeUntil, type Observable } from 'rxjs';
import { Auth, CurrentUser, type RequestUser } from '../auth/auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** Gửi dòng ping định kỳ để proxy / fetch không đóng kết nối vì im lặng quá lâu. */
const PING_MS = 25_000;
/** Chu kỳ kiểm tra lại phiên của kết nối admin (tài khoản bị khoá / đổi mật khẩu thì ngắt). */
const SESSION_CHECK_MS = 60_000;

const ping = () => interval(PING_MS).pipe(map((): MessageEvent => ({ type: 'ping', data: '' })));

/**
 * Kênh sự kiện realtime qua Server-Sent Events, chạy trong bộ nhớ của tiến trình API
 * (một instance API là đủ cho quy mô cửa hàng; chạy nhiều instance thì cần Redis pub/sub).
 */
@Injectable()
export class RealtimeService {
  private readonly publicEvents = new Subject<PublicRealtimeEvent>();
  private readonly adminEvents = new Subject<AdminRealtimeEvent>();

  /** Sự kiện cho web khách hàng — chỉ gửi sau khi cache của web đã được xoá. */
  publishPublic(event: PublicRealtimeEvent): void {
    this.publicEvents.next(event);
  }

  publishAdmin(event: AdminRealtimeEvent): void {
    this.adminEvents.next(event);
  }

  publicStream(): Observable<MessageEvent> {
    return merge(this.publicEvents.pipe(map((data): MessageEvent => ({ data }))), ping());
  }

  adminStream(): Observable<MessageEvent> {
    return merge(this.adminEvents.pipe(map((data): MessageEvent => ({ data }))), ping());
  }
}

@Controller()
export class RealtimeController {
  constructor(
    private readonly realtime: RealtimeService,
    private readonly prisma: PrismaService,
  ) {}

  /** Web khách hàng: báo nhóm dữ liệu vừa thay đổi để trình duyệt tải lại trang. */
  @Sse('events')
  publicEvents(): Observable<MessageEvent> {
    return this.realtime.publicStream();
  }

  /** Trang quản trị: đơn hàng / liên hệ mới, thay đổi dữ liệu do người khác thực hiện. */
  @Sse('admin/events')
  @Auth()
  adminEvents(@CurrentUser() user: RequestUser): Observable<MessageEvent> {
    const connectedAt = Date.now();
    const revoked = interval(SESSION_CHECK_MS).pipe(
      mergeMap(() => from(this.prisma.user.findUnique({ where: { id: user.id } }))),
      filter((row) => !row || !row.isActive || row.passwordChangedAt.getTime() > connectedAt + 1000),
    );
    return this.realtime.adminStream().pipe(takeUntil(revoked));
  }
}

@Global()
@Module({
  controllers: [RealtimeController],
  providers: [RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
