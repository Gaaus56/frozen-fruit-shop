import type { NextConfig } from "next";

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

export default nextConfig;
