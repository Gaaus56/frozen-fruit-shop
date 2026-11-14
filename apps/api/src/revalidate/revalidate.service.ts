import { Global, Injectable, Logger, Module } from '@nestjs/common';
import type { CacheTag } from '@frozen-fruit-shop/types';
import { env } from '../config/env.js';
import { RealtimeService } from '../realtime/realtime.module.js';

export type { CacheTag };

/**
 * Gọi sau mỗi thay đổi dữ liệu hiển thị trên web khách hàng:
 * 1. Báo ngay cho các trang quản trị đang mở (admin đọc thẳng từ API, không có cache).
 * 2. Báo web khách hàng xoá cache theo tag (không phải chờ hết hạn cache tối đa 5 phút).
 * 3. Sau khi cache đã xoá, báo trình duyệt khách đang mở tải lại — tránh tải lại mà vẫn nhận dữ liệu cũ.
 * Lỗi ở đây chỉ ghi log, không làm hỏng thao tác chính.
 */
@Injectable()
export class RevalidateService {
  private readonly logger = new Logger(RevalidateService.name);

  constructor(private readonly realtime: RealtimeService) {}

  notify(...tags: CacheTag[]): void {
    this.realtime.publishAdmin({ type: 'changed', tags });
    void this.revalidateWeb(tags).finally(() => this.realtime.publishPublic({ type: 'changed', tags }));
  }

  private async revalidateWeb(tags: CacheTag[]): Promise<void> {
    if (!env.webRevalidateUrl || !env.revalidateSecret) return;
    try {
      const res = await fetch(env.webRevalidateUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-revalidate-secret': env.revalidateSecret },
        body: JSON.stringify({ tags }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) this.logger.warn(`Web revalidate trả về HTTP ${res.status}`);
    } catch (error) {
      this.logger.warn(`Không gọi được web revalidate: ${error instanceof Error ? error.message : error}`);
    }
  }
}

@Global()
@Module({
  providers: [RevalidateService],
  exports: [RevalidateService],
})
export class RevalidateModule {}
