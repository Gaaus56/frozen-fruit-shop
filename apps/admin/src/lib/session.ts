import "server-only";
import { cookies, headers } from "next/headers";

export const SESSION_COOKIE = "admin_token";

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Lưu access token trong cookie httpOnly — JavaScript phía trình duyệt không đọc được. */
export async function setToken(token: string, expiresAt: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearToken(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Header báo API IP thật của người dùng. Admin gọi API thay trình duyệt nên API chỉ thấy IP server admin —
 * thiếu cái này, giới hạn số lần đăng nhập sai bị tính chung cho mọi người (ai cũng bị chặn khi một người gõ sai nhiều).
 * Vercel / Caddy ghi đè x-forwarded-for bằng IP kết nối thật nên trình duyệt không giả được.
 * API chỉ tin khi khoá INTERNAL_PROXY_SECRET khớp; chưa đặt khoá thì không gửi gì.
 */
export async function clientIpHeaders(): Promise<Record<string, string>> {
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (!secret) return {};
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
  return ip ? { "x-client-ip": ip.slice(0, 64), "x-internal-secret": secret } : {};
}
