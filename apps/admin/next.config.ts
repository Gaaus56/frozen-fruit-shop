import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

/**
 * Header bảo mật cho mọi trang quản trị: không cho trang khác nhúng admin vào iframe (chống lừa bấm nút
 * "Huỷ đơn", "Xoá nhân viên" — clickjacking), không đoán kiểu file, không gửi đường dẫn admin sang trang ngoài.
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  experimental: {
    serverActions: {
      // Ảnh tải lên tối đa 5MB (API cũng giới hạn 5MB) + phần đệm của multipart.
      bodySizeLimit: "6mb",
    },
  },
};

/**
 * Sentry (theo dõi lỗi): gắn khi build. Có SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT thì tải source map lên
 * (Sentry chỉ đúng dòng code gây lỗi) rồi xoá khỏi bản deploy; không có thì bỏ qua bước tải, web vẫn build bình thường.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN, deleteSourcemapsAfterUpload: true },
  // Bỏ phần không dùng (ghi lại phiên xem, debug log) cho nhẹ bundle trình duyệt.
  bundleSizeOptimizations: { excludeDebugStatements: true, excludeReplayIframe: true, excludeReplayShadowDom: true, excludeReplayWorker: true },
});
