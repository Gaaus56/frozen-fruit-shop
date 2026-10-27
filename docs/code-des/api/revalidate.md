# API — Revalidate — cầu nối API ↔ cache web

Web cache dữ liệu API tối đa 5 phút, gắn theo **tag** (`catalog`, `content`, `settings`). Để khách thấy thay đổi ngay, mỗi lần admin sửa dữ liệu API gọi `RevalidateService.notify(...tags)`:

1. `publishAdmin({ type: "changed", tags })` — báo ngay các trang admin đang mở (admin đọc thẳng từ API, không có cache).
2. `POST <WEB_REVALIDATE_URL>` với header `x-revalidate-secret: <REVALIDATE_SECRET>` và body `{ tags }` (timeout 5 giây) → web gọi `revalidateTag(tag, { expire: 0 })` nên lần truy cập kế tiếp tải dữ liệu mới ngay.
3. Sau khi bước 2 xong (kể cả lỗi), `publishPublic({ type: "changed", tags })` — báo trình duyệt khách đang mở tải lại, tránh tải lại mà vẫn nhận dữ liệu cũ.

Chưa đặt `WEB_REVALIDATE_URL` / `REVALIDATE_SECRET` thì bỏ qua bước 2. Lỗi ở đây chỉ ghi log (`warn`), không làm hỏng thao tác chính.

Phía web, route nhận nằm ở `apps/web/src/app/api/revalidate/route.ts`: kiểm tra khoá bằng `timingSafeEqual`, chỉ nhận tag trong danh sách cho phép.

**Code**

- `apps/api/src/revalidate/revalidate.service.ts` — `RevalidateService`, `RevalidateModule` (`@Global()`)
- `apps/web/src/app/api/revalidate/route.ts`, `apps/web/src/lib/api.ts` (gắn tag cho từng request)
