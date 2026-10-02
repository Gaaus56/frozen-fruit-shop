import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

interface RateLimitOptions {
  /** Số request tối đa trong một cửa sổ thời gian. */
  limit: number;
  /** Độ dài cửa sổ, tính bằng giây. */
  windowSeconds: number;
}

const RATE_LIMIT_KEY = 'rate-limit';

/**
 * Giới hạn số request theo IP cho các endpoint công khai dễ bị spam (đặt hàng, gửi liên hệ, đăng nhập).
 * Lưu trong bộ nhớ tiến trình — đủ cho một instance API; khi chạy nhiều instance cần chuyển sang Redis.
 */
export function RateLimit(limit: number, windowSeconds: number) {
  return applyDecorators(
    SetMetadata(RATE_LIMIT_KEY, { limit, windowSeconds } satisfies RateLimitOptions),
    UseGuards(RateLimitGuard),
  );
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const key = `${context.getClass().name}.${context.getHandler().name}:${request.ip ?? 'unknown'}`;
    const now = Date.now();

    if (this.hits.size > 10_000) this.sweep(now);

    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + options.windowSeconds * 1000 });
      return true;
    }

    entry.count += 1;
    if (entry.count > options.limit) {
      throw new HttpException(
        'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  private sweep(now: number) {
    for (const [key, entry] of this.hits) {
      if (entry.resetAt <= now) this.hits.delete(key);
    }
  }
}
