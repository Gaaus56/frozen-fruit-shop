import {
  CallHandler,
  Controller,
  ExecutionContext,
  Get,
  Injectable,
  Logger,
  Module,
  NestInterceptor,
  Query,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { Observable, from, mergeMap } from 'rxjs';
import type { AuditChange, AuditLogEntry, Paginated } from '@frozen-fruit-shop/types';
import { Auth, type RequestUser } from '../auth/auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

type Row = Record<string, unknown>;

/** Cách đọc một bản ghi trước / sau khi sửa, theo đoạn đường dẫn sau /admin/. */
interface ResourceConfig {
  find: (prisma: PrismaService, id: string) => Promise<Row | null>;
  label: (row: Row) => string;
}

const text = (value: unknown) => (typeof value === 'string' ? value : '');

const asRow = (promise: Promise<unknown>) => promise as Promise<Row | null>;

const RESOURCES: Record<string, ResourceConfig> = {
  orders: {
    find: (p, id) => asRow(p.order.findUnique({ where: { id }, include: { items: true } })),
    label: (r) => `Đơn ${text(r.orderNumber)}`,
  },
  inquiries: { find: (p, id) => asRow(p.inquiry.findUnique({ where: { id } })), label: (r) => `Liên hệ của ${text(r.name)}` },
  products: {
    find: (p, id) =>
      asRow(
        p.product.findUnique({
          where: { id },
          include: { variants: { orderBy: { sortOrder: 'asc' } }, images: { orderBy: { sortOrder: 'asc' } } },
        }),
      ),
    label: (r) => text(r.name),
  },
  categories: { find: (p, id) => asRow(p.category.findUnique({ where: { id } })), label: (r) => text(r.name) },
  banners: {
    find: (p, id) => asRow(p.banner.findUnique({ where: { id } })),
    label: (r) => text(r.title) || `Banner ${text(r.placement)}`,
  },
  'home-blocks': {
    find: (p, id) => asRow(p.homeBlock.findUnique({ where: { id } })),
    label: (r) => text(r.title) || 'Khối không tiêu đề',
  },
  posts: { find: (p, id) => asRow(p.post.findUnique({ where: { id } })), label: (r) => text(r.title) },
  comments: { find: (p, id) => asRow(p.comment.findUnique({ where: { id } })), label: (r) => `Bình luận của ${text(r.name)}` },
  policies: { find: (p, id) => asRow(p.policy.findUnique({ where: { id } })), label: (r) => text(r.title) },
  pages: { find: (p, slug) => asRow(p.page.findUnique({ where: { slug } })), label: (r) => text(r.title) },
  settings: { find: (p) => asRow(p.siteSetting.findUnique({ where: { id: 1 } })), label: () => 'Thông tin cửa hàng' },
  users: { find: (p, id) => asRow(p.user.findUnique({ where: { id } })), label: (r) => `${text(r.name)} (${text(r.email)})` },
};

/** Trường không ghi lịch sử: kỹ thuật, tự đổi, hoặc nhạy cảm. */
const SKIP_FIELDS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'passwordHash',
  'passwordChangedAt',
  'failedLoginCount',
  'lockedUntil',
  'lastLoginAt',
  // OTP: khoá bí mật (dù đã mã hoá) và mã dự phòng không bao giờ ghi vào lịch sử.
  'otpSecret',
  'otpPendingSecret',
  'otpLastTimeStep',
  'otpRecoveryCodes',
]);
const MAX_TEXT = 160;

function shorten(value: string): string {
  // Nội dung soạn thảo (HTML) → chữ thường cho dễ đọc.
  const plain = value.includes('<') ? value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : value;
  return plain.length > MAX_TEXT ? `${plain.slice(0, MAX_TEXT)}…` : plain;
}

/** Một phần tử con (quy cách, ảnh, dòng đơn) → một dòng chữ. */
function describeItem(item: unknown): string {
  if (!item || typeof item !== 'object') return String(item);
  return Object.entries(item as Row)
    .filter(([key, value]) => !SKIP_FIELDS.has(key) && !key.endsWith('Id') && value !== null && value !== '')
    .map(([, value]) => (value instanceof Date ? value.toISOString() : typeof value === 'object' ? JSON.stringify(value) : String(value)))
    .join(' · ');
}

function toText(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.length === 0 ? null : shorten(value.map(describeItem).join(' | '));
  if (typeof value === 'object') return shorten(JSON.stringify(value));
  return shorten(String(value));
}

/** So sánh hai bản ghi, trả về các trường đã đổi (giá trị đã rút gọn). */
export function diffRows(before: Row | null, after: Row | null): AuditChange[] {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  const changes: AuditChange[] = [];
  for (const field of keys) {
    if (SKIP_FIELDS.has(field)) continue;
    const a = toText(before?.[field]);
    const b = toText(after?.[field]);
    if (a !== b) changes.push({ field, before: a, after: b });
  }
  return changes;
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
/** Không ghi: tải ảnh (chỉ là tệp, việc gắn ảnh được ghi ở bản ghi chứa ảnh). */
const SKIP_RESOURCES = new Set(['uploads']);

/**
 * Tự ghi lịch sử mọi thao tác thêm / sửa / xoá của tài khoản quản trị qua /admin/*:
 * đọc bản ghi trước khi xử lý, chạy endpoint, đọc lại sau đó và lưu các trường đã đổi.
 * Ghi lịch sử lỗi thì chỉ log, không làm hỏng thao tác của người dùng.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const segments = (request.path ?? '').split('/').filter(Boolean);
    const user = request.user;
    if (!user || !MUTATING.has(request.method) || segments[0] !== 'admin' || SKIP_RESOURCES.has(segments[1] ?? '')) {
      return next.handle();
    }

    const resource = segments[1] ?? '';
    const config = RESOURCES[resource];
    const pathId = segments[2] ? decodeURIComponent(segments[2]) : null;
    const subAction = segments[3] ?? null;
    const action =
      subAction ?? (request.method === 'POST' ? 'create' : request.method === 'DELETE' ? 'delete' : 'update');
    const lookupId = resource === 'settings' ? 'settings' : pathId;

    return from(config && lookupId ? config.find(this.prisma, lookupId).catch(() => null) : Promise.resolve(null)).pipe(
      mergeMap((before) =>
        next.handle().pipe(
          mergeMap(async (result: unknown) => {
            try {
              const createdId = action === 'create' && result && typeof result === 'object' ? text((result as Row).id) || null : null;
              const entityId = pathId ?? createdId;
              const afterId = resource === 'settings' ? 'settings' : entityId;
              const after = config && afterId && action !== 'delete' ? await config.find(this.prisma, afterId).catch(() => null) : null;
              // Đặt lại mật khẩu / tắt OTP nhân viên: không ghi giá trị, chỉ ghi là đã làm.
              const changes = action === 'reset-password' || action === 'reset-otp' ? [] : diffRows(before, after);
              if (action === 'update' && changes.length === 0) return result;
              const labelRow = after ?? before;
              await this.prisma.auditLog.create({
                data: {
                  userId: user.id,
                  userName: user.name,
                  userEmail: user.email,
                  userRole: user.role,
                  action,
                  resource,
                  entityId,
                  entityLabel: config && labelRow ? config.label(labelRow).slice(0, 200) : '',
                  changes: changes as unknown as Prisma.InputJsonValue,
                },
              });
            } catch (error) {
              this.logger.warn(`Không ghi được lịch sử ${request.method} ${request.path}: ${String(error)}`);
            }
            return result;
          }),
        ),
      ),
    );
  }
}

class AuditQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() resource?: string;
}

@Controller('admin/audit-logs')
@Auth('ADMIN')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: AuditQuery): Promise<Paginated<AuditLogEntry>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 30;
    const where: Prisma.AuditLogWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.resource ? { resource: query.resource } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.auditLog.count({ where }),
    ]);
    return {
      items: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        userName: row.userName,
        userEmail: row.userEmail,
        userRole: row.userRole,
        action: row.action,
        resource: row.resource,
        entityId: row.entityId,
        entityLabel: row.entityLabel,
        changes: (row.changes as AuditChange[] | null) ?? [],
        createdAt: row.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }
}

@Module({
  controllers: [AuditController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
})
export class AuditModule {}
