import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "admin_token";
// /api/*: route handler tự kiểm tra phiên và trả 401 (EventSource không xử lý được chuyển hướng tới trang HTML).
const PUBLIC_PATHS = ["/login", "/logout", "/api"];

/**
 * Chặn sớm các trang quản trị khi chưa có cookie phiên. Việc kiểm tra token thật (hết hạn, bị khoá,
 * đúng vai trò) do API đảm nhiệm ở mỗi request — proxy chỉ để chuyển hướng nhanh.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const hasToken = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasToken && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|icon.png|favicon.ico).*)"],
};
