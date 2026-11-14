import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/session";

export const dynamic = "force-dynamic";
// Trên Vercel kết nối bị cắt sau thời lượng tối đa của function; trình duyệt tự nối lại (shared-event-source) và tải
// lại dữ liệu nếu có thể đã lỡ sự kiện. Giới hạn rõ 5 phút để không bị tính phí chạy liên tục. Máy chủ riêng bỏ qua.
export const maxDuration = 300;

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
