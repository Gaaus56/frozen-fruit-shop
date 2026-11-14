import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/** /robots.txt: cho Google đọc web, bỏ qua các trang riêng của khách (giỏ hàng, thanh toán, tra cứu đơn). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/checkout", "/order-lookup", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
