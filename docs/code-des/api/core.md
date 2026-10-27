# API — Khởi động & nền tảng

`apps/api` — NestJS (ESM) + Prisma + PostgreSQL, cổng 4000. Là **nguồn sự thật duy nhất**: web và admin chỉ gọi API.

## Khởi động

1. **`bootstrap()`** (`main.ts`) — tạo app NestJS, rồi:
   - bật `trust proxy` (đọc đúng IP khách sau Caddy), tắt `x-powered-by`, giới hạn body JSON 1MB;
   - set header bảo mật `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`;
   - bật CORS theo `CORS_ORIGINS` (các method GET / POST / PATCH / PUT / DELETE);
   - phục vụ tĩnh `/uploads/seed/*` (ảnh dữ liệu mẫu nằm sẵn trong `prisma/seed-assets`, vẫn hiện khi máy chủ không có ổ đĩa lâu dài) và `/uploads/*` (ảnh admin tải lên, cache 365 ngày, `immutable`, không liệt kê thư mục);
   - gắn `PrismaExceptionFilter` + `ValidationPipe` toàn cục (`whitelist`, `forbidNonWhitelisted`, `transform`);
   - bật shutdown hooks.
2. **`HealthController`** (`app.module.ts`) — `GET /health` chạy `SELECT 1`, dùng cho Docker / giám sát.
3. **`AppModule`** — khai báo các module: `Prisma`, `Realtime`, `Revalidate`, `Auth`, `Audit`, `Users`, `Categories`, `Products`, `Content`, `Orders`, `Inquiries`, `Comments`, `Uploads`, `Stats`.

## Theo dõi lỗi (Sentry)

- `apps/api/src/instrument.ts` được import **đầu tiên** trong `main.ts` để Sentry gắn được vào Nest / Express. Chỉ bật khi có `SENTRY_DSN`; không có thì không gửi gì.
- `SentryModule.forRoot()` + `SentryGlobalFilter` (`app.module.ts`): lỗi 5xx không lường trước được gửi Sentry; lỗi 4xx (sai dữ liệu, chưa đăng nhập…) thì không. `PrismaExceptionFilter` tự gửi các lỗi DB lạ.
- **Không gửi dữ liệu cá nhân**: tắt thông tin người dùng, cookie, body; header chỉ giữ `user-agent` / `content-type` / `referer`; `beforeSend` xoá `authorization`, `cookie` và `request.data`; query `otpToken`, `token`, `phone`, `q` bị chặn. `tracesSampleRate: 0` (không đo hiệu năng).
- Biến môi trường: `SENTRY_DSN`, `SENTRY_ENVIRONMENT` (mặc định `production` / `development`).
- Cùng cách làm ở web và admin: `instrumentation.ts` (server), `instrumentation-client.ts` (trình duyệt, đọc `NEXT_PUBLIC_SENTRY_DSN`), `error.tsx` / `global-error.tsx` gọi `Sentry.captureException`, `next.config.ts` bọc `withSentryConfig` (tải source map lên nếu có `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT`, rồi xoá khỏi bản deploy). Hướng dẫn tạo tài khoản: `docs/04-operations/monitoring-and-backup.md` §2.1.

## Bảo vệ endpoint

Các decorator trong `auth/auth.guard.ts` (xem [auth.md](auth.md)):

- `@Auth(...roles)` — bắt buộc đăng nhập; truyền `'ADMIN'` để chỉ cho ADMIN.
- `@Permission(...)` — nhân viên cần ít nhất một trong các quyền liệt kê (ADMIN luôn qua).
- `@RequireOtp()` — thao tác nhạy cảm cần mã OTP gần đây (nếu tài khoản đã bật OTP).
- `@RateLimit(limit, windowSeconds)` — giới hạn theo IP.

## Luồng ghi dữ liệu hiển thị trên web

Mỗi service ghi dữ liệu gọi `RevalidateService.notify(...tags)`: báo admin đang mở, báo web xoá cache theo tag, rồi báo trình duyệt khách tải lại. Xem [revalidate.md](revalidate.md), [realtime.md](realtime.md). Mọi thao tác ghi qua `/admin/*` còn được ghi tự động vào lịch sử ([audit.md](audit.md)).

## Code

- `apps/api/src/main.ts`, `app.module.ts`
- `apps/api/src/config/env.ts` — đọc biến môi trường: `PORT`, `DATABASE_URL`, `PUBLIC_URL`, `CORS_ORIGINS`, `JWT_SECRET` (≥ 32 ký tự khi production), `JWT_EXPIRES_IN` (mặc định `12h`), `OTP_ENCRYPTION_KEY`, `UPLOAD_DIR`, `WEB_REVALIDATE_URL`, `REVALIDATE_SECRET`, `SENTRY_DSN`, `SENTRY_ENVIRONMENT`. Tự nạp `apps/api/.env` bằng `process.loadEnvFile`.
- `apps/api/src/common/`
  - `prisma-exception.filter.ts` — đổi lỗi Prisma (trùng khoá, không tìm thấy…) thành mã HTTP + thông báo tiếng Việt
  - `rate-limit.guard.ts` — `@RateLimit`, lưu trong bộ nhớ tiến trình
  - `validators.ts` — `@Trim()`, `@IsSlug()`, `@IsImagePath()`
  - `utils.ts` — `slugify`, `toPublicUrl` / `toStoredPath` (ảnh lưu `/uploads/...`, trả ra URL tuyệt đối theo `PUBLIC_URL`), `normalizePhone`, `iso`
  - `pagination.ts` — `PaginationQueryDto`, `paginate`
  - `rich-text.ts` — `sanitizeRichText` (lọc HTML trước khi lưu: chỉ giữ thẻ / thuộc tính do trình soạn thảo tạo ra) và `toRichTextOutput` (đổi đường dẫn ảnh thành URL đầy đủ)

## Kiểu dữ liệu dùng chung

`packages/types/src/index.ts` — mọi kiểu trả về của API (`Product`, `Order`, `OrderDetail`, `Category`, `Banner`, `Post`, `Policy`, `SiteSettings`, `DashboardStats`, `Paginated<T>`…), nhãn tiếng Việt (`ORDER_STATUS_LABELS`…), quyền nhân viên (`STAFF_PERMISSIONS`), giá trị mặc định (`DEFAULT_SITE_SETTINGS`) và hằng dùng chung web ↔ admin (`PreviewMessage`, `EditKind`). Sửa một chỗ, TypeScript báo lỗi ở mọi app dùng sai.

Từng module: [auth](auth.md) · [users](users.md) · [categories](categories.md) · [products](products.md) · [orders](orders.md) · [inquiries](inquiries.md) · [comments](comments.md) · [content](content.md) · [uploads](uploads.md) · [stats](stats.md) · [audit](audit.md) · [realtime](realtime.md) · [revalidate](revalidate.md) · [database](database.md)
