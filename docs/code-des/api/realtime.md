# API — Realtime (`/events`, `/admin/events`) — Server-Sent Events

Kênh sự kiện một chiều, chạy **trong bộ nhớ** của tiến trình API (một instance là đủ; chạy nhiều instance thì cần Redis pub/sub).

| Endpoint | Ai nghe | Sự kiện |
|---|---|---|
| `GET /events` (công khai) | web khách hàng | `{ type: "changed", tags }` — chỉ báo nhóm dữ liệu nào vừa đổi (`catalog` / `content` / `settings`), không chứa dữ liệu. Chỉ gửi **sau khi** cache của web đã bị xoá |
| `GET /admin/events` (`@Auth()`) | trang quản trị | `order.created`, `order.updated`, `inquiry.created`, `inquiry.updated`, `comment.created`, `comment.updated` và `changed` do người khác sửa dữ liệu |

- Mỗi 25 giây gửi một dòng `ping` để proxy / fetch không đóng kết nối vì im lặng.
- Kết nối admin được kiểm tra lại mỗi 60 giây: tài khoản bị khoá / xoá / đổi mật khẩu thì **ngắt luồng**.
- Phía trình duyệt: `LiveUpdates` (web và admin) dùng `shared-event-source.ts` để mọi tab cùng trình duyệt chia sẻ **một** kết nối (tab "trưởng" giữ Web Lock, chuyển sự kiện cho tab khác qua `BroadcastChannel`) — tránh chiếm hết 6 kết nối HTTP/1.1.

**Code**

- `apps/api/src/realtime/realtime.module.ts` — `RealtimeService` (`publishPublic`, `publishAdmin`), `RealtimeController`, module `@Global()`
- Kiểu sự kiện: `packages/types` (`DataChangedEvent`, `PublicRealtimeEvent`, `AdminRealtimeEvent`, `CacheTag`)
- Phía web: `components/layout/live-updates.tsx`; phía admin: `components/layout/live-updates.tsx`, `app/api/events/route.ts`
