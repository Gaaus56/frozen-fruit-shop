import { API_URL } from "@/lib/api";
import { getToken } from "@/lib/session";

export const dynamic = "force-dynamic";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Tải file Excel đơn hàng: token nằm trong cookie httpOnly nên trình duyệt không gọi thẳng API được —
 * server admin gắn token, chuyển bộ lọc (trạng thái, ô tìm, khoảng ngày theo giờ Việt Nam) rồi trả nguyên file về.
 * Quyền "Đơn hàng" do API kiểm tra.
 */
export async function GET(request: Request) {
  const token = await getToken();
  if (!token) return new Response("Phiên đăng nhập đã hết hạn.", { status: 401 });

  const input = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  for (const key of ["status", "q"]) {
    const value = input.get(key)?.trim();
    if (value) params.set(key, value);
  }
  const from = input.get("from") ?? "";
  const to = input.get("to") ?? "";
  if (DATE.test(from)) params.set("from", `${from}T00:00:00+07:00`);
  if (DATE.test(to)) params.set("to", `${to}T23:59:59.999+07:00`);

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/admin/orders/export?${params.toString()}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return new Response("Không kết nối được máy chủ, vui lòng thử lại.", { status: 502 });
  }
  if (!upstream.ok) {
    const message = upstream.status === 403 ? "Tài khoản của bạn không có quyền xem đơn hàng." : `Xuất file thất bại (mã lỗi ${upstream.status}).`;
    return new Response(message, { status: upstream.status, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  return new Response(upstream.body, {
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "content-disposition": upstream.headers.get("content-disposition") ?? 'attachment; filename="don-hang.xlsx"',
      "cache-control": "no-store",
    },
  });
}
