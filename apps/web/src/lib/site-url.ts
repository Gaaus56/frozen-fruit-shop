/**
 * Địa chỉ gốc của web khách hàng (không có "/" cuối) — dùng cho sitemap, robots, link chia sẻ (Open Graph),
 * canonical. Production phải đặt NEXT_PUBLIC_SITE_URL = tên miền thật, ví dụ https://traicaydonglanh28.com.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
