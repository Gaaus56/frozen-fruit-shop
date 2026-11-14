import { Controller, Global, HttpException, HttpStatus, Injectable, Module, Req, Sse, type MessageEvent } from '@nestjs/common';
import type { AdminRealtimeEvent, PublicRealtimeEvent, StaffPermission } from '@frozen-fruit-shop/types';
import type { Request } from 'express';
import { Subject, filter, finalize, from, interval, map, merge, mergeMap, takeUntil, type Observable } from 'rxjs';
import { Auth, CurrentUser, type RequestUser } from '../auth/auth.guard.js';
import { clientIp } from '../common/rate-limit.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** Gửi dòng ping định kỳ để proxy / fetch không đóng kết nối vì im lặng quá lâu. */
const PING_MS = 25_000;
/** Chu kỳ kiểm tra lại phiên của kết nối admin (tài khoản bị khoá / đổi mật khẩu thì ngắt). */
const SESSION_CHECK_MS = 60_000;

/**
 * Số kết nối /events tối đa mỗi IP. Mỗi trình duyệt chỉ giữ một kết nối cho mọi tab (shared-event-source),
 * nên 20 đủ cho cả quán cà phê dùng chung wifi; chặn một máy mở hàng nghìn kết nối làm cạn tài nguyên API.
 */
const MAX_PUBLIC_STREAMS_PER_IP = 20;

/** Quyền cần có để nhận từng loại sự kiện admin (thông tin khách hàng chỉ tới người được xem mục đó). */
const EVENT_PERMISSION: Partial<Record<AdminRealtimeEvent['type'], StaffPermission>> = {
  'order.created': 'orders',
  'order.updated': 'orders',
  'inquiry.created': 'inquiries',
  'inquiry.updated': 'inquiries',
  'comment.created': 'comments',
  'comment.updated': 'comments',
};

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

  /** Sự kiện admin, bỏ những loại tài khoản không có quyền xem (ADMIN có đủ mọi quyền). */
  adminStream(permissions: readonly StaffPermission[]): Observable<MessageEvent> {
    const allowed = (event: AdminRealtimeEvent) => {
      const needed = EVENT_PERMISSION[event.type];
      return !needed || permissions.includes(needed);
    };
    return merge(this.adminEvents.pipe(filter(allowed), map((data): MessageEvent => ({ data }))), ping());
  }
}

@Controller()
export class RealtimeController {
  private readonly openStreams = new Map<string, number>();

  constructor(
    private readonly realtime: RealtimeService,
    private readonly prisma: PrismaService,
  ) {}

  /** Web khách hàng: báo nhóm dữ liệu vừa thay đổi để trình duyệt tải lại trang. */
  @Sse('events')
  publicEvents(@Req() request: Request): Observable<MessageEvent> {
    const ip = clientIp(request);
    const open = this.openStreams.get(ip) ?? 0;
    if (open >= MAX_PUBLIC_STREAMS_PER_IP) {
      throw new HttpException('Quá nhiều kết nối từ địa chỉ này.', HttpStatus.TOO_MANY_REQUESTS);
    }
    this.openStreams.set(ip, open + 1);
    return this.realtime.publicStream().pipe(
      finalize(() => {
        const left = (this.openStreams.get(ip) ?? 1) - 1;
        if (left > 0) this.openStreams.set(ip, left);
        else this.openStreams.delete(ip);
      }),
    );
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
    return this.realtime.adminStream(user.permissions).pipe(takeUntil(revoked));
  }
}

@Global()
@Module({
  controllers: [RealtimeController],
  providers: [RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
