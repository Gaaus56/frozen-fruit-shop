import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

/** Trang admin được nhúng web vào khung "Xem trước & sửa"; trang khác không nhúng được (chống clickjacking). */
const adminOrigin = new URL(process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002").origin;

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: `frame-ancestors 'self' ${adminOrigin}` }] }];
  },
  images: {
    // Ảnh sản phẩm/banner do API phục vụ tại <API>/uploads/...
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/uploads/**",
      },
    ],
    // Khi phát triển, API chạy ở localhost — Next 16 mặc định chặn tối ưu ảnh từ IP nội bộ.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
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
