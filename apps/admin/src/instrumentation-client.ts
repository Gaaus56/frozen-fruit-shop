// Theo dõi lỗi trên trình duyệt bằng Sentry. Chỉ bật khi có NEXT_PUBLIC_SENTRY_DSN.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  tracesSampleRate: 0,
  dataCollection: { userInfo: false, cookies: false, httpBodies: [] },
  // Lỗi do tiện ích trình duyệt / mạng chập chờn của khách — không phải lỗi web, bỏ qua cho đỡ nhiễu.
  ignoreErrors: ["ResizeObserver loop", "Failed to fetch", "Load failed", "NetworkError when attempting to fetch resource"],
  denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari-web-extension:\/\//],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
