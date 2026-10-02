import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/** Xoá cookie phiên rồi về trang đăng nhập. `?expired=1` khi phiên hết hạn/bị thu hồi. */
export function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  if (request.nextUrl.searchParams.get("expired")) loginUrl.searchParams.set("expired", "1");
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const POST = GET;
