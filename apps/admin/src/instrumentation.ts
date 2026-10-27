// Theo dõi lỗi phía server (Server Components, Server Actions, route handlers) bằng Sentry.
// Chỉ bật khi có SENTRY_DSN (hoặc NEXT_PUBLIC_SENTRY_DSN); không có thì không gửi gì.
import * as Sentry from "@sentry/nextjs";

export function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  Sentry.init({
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    // Không gửi cookie (phiên đăng nhập), body (thông tin khách), thông tin người dùng.
    dataCollection: { userInfo: false, cookies: false, httpBodies: [], httpHeaders: { allow: ["user-agent", "referer"] } },
  });
}

/** Lỗi khi Next xử lý request (render trang, Server Action…) → gửi Sentry. */
export const onRequestError = Sentry.captureRequestError;
