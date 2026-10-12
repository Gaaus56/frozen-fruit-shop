import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/** Xoá cookie phiên rồi về trang đăng nhập. `?expired=1` khi phiên hết hạn/bị thu hồi; `?bye=1` khi tự bấm Đăng xuất. */
export function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  if (request.nextUrl.searchParams.get("expired")) loginUrl.searchParams.set("expired", "1");
  // Bấm "Đăng xuất" (LogoutButton): trang đăng nhập chạy hiệu ứng hiện lại (ngược với lúc đăng nhập).
  if (request.nextUrl.searchParams.get("bye")) loginUrl.searchParams.set("bye", "1");
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const POST = GET;
