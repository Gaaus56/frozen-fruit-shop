import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Chuyển tiếp luồng sự kiện realtime của API (GET /admin/events) tới trình duyệt. Token nằm trong cookie
 * httpOnly nên trình duyệt không tự gọi API được — server admin gắn token rồi truyền nguyên luồng về.
 */
export async function GET(request: Request) {
  const token = await getToken();
  if (!token) return new Response(null, { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/admin/events`, {
      headers: { authorization: `Bearer ${token}`, accept: "text/event-stream" },
      signal: request.signal,
      cache: "no-store",
    });
  } catch {
    return new Response(null, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: upstream.status === 401 ? 401 : 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "content-type": "text/event-stream",
      // no-transform: không cho lớp nén gzip gom dữ liệu lại làm trễ sự kiện.
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
