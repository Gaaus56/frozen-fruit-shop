import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Ảnh tải lên tối đa 5MB (API cũng giới hạn 5MB) + phần đệm của multipart.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
