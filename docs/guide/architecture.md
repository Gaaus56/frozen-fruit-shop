# Kiến trúc hệ thống

## 1. Thành phần

```
                 Trình duyệt khách                     Trình duyệt chủ shop / nhân viên
                        │                                           │
         ┌──────────────┴──────────────┐                            │
         │ trang HTML         đặt hàng, │                            │ HTML + Server Actions
         ▼                   tra cứu,   │                            ▼
 ┌────────────────┐        liên hệ     │                  ┌──────────────────┐
 │ apps/web :3000 │                    │                  │ apps/admin :3002 │
 │ Next.js (SSR + │                    │                  │ Next.js, cookie  │
 │ cache 5 phút)  │                    │                  │ httpOnly (JWT)   │
 └───────┬────────┘                    │                  └────────┬─────────┘
         │ GET dữ liệu công khai       │                           │ /admin/* + Bearer JWT
         ▼                             ▼                           ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ apps/api :4000 — NestJS 12 + Prisma 6                                        │
 │  • route công khai  /products /categories /posts /banners /policies /settings│
 │                     /orders (quote, tạo, tra cứu) /inquiries                 │
 │  • route quản trị   /admin/*  (JWT, kiểm tra quyền ADMIN / STAFF)            │
 │  • /uploads/*       ảnh do admin tải lên (lưu trên đĩa)                      │
 └───────┬──────────────────────────────────────────────────┬──────────────────┘
         │ Prisma                                            │ POST /api/revalidate (khoá bí mật)
         ▼                                                   ▼
 ┌────────────────┐                                  báo web xoá cache ngay
 │ PostgreSQL 16  │                                  khi admin sửa dữ liệu
 └────────────────┘
```

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| `apps/web` | Next.js 16 (App Router), React 19, Tailwind CSS 4 | Website bán hàng cho khách |
| `apps/admin` | Next.js 16, React 19, Tailwind CSS 4 | Trang quản trị cho chủ shop và nhân viên |
| `apps/api` | NestJS 12 (ESM), Prisma 6, class-validator, JWT (`@nestjs/jwt`), bcryptjs | REST API duy nhất, nắm toàn bộ nghiệp vụ và phân quyền |
| Database | PostgreSQL 16 (Docker) | Lưu dữ liệu |
| `packages/types` | TypeScript | Hợp đồng dữ liệu dùng chung (type, nhãn tiếng Việt, thông tin cửa hàng mặc định) |

Monorepo dùng **npm workspaces**: một lệnh `npm install` ở gốc cho cả ba app.

## 2. Nguyên tắc thiết kế

- **API là nguồn sự thật duy nhất.** Web và admin không truy cập database trực tiếp; mọi kiểm tra dữ liệu và phân quyền nằm ở API.
- **Không tin dữ liệu từ trình duyệt.** Giá, tạm tính, trạng thái còn hàng luôn được API tính lại từ database khi báo giá và khi tạo đơn; giá phía client chỉ để hiển thị.
- **Hợp đồng chung.** Kiểu dữ liệu trả về của API được khai báo một lần trong `packages/types` và dùng ở cả ba app — sửa một chỗ, TypeScript báo lỗi ở mọi nơi dùng sai.
- **Không có dữ liệu mẫu.** Database khởi tạo rỗng (chỉ có tài khoản ADMIN tạo bằng lệnh). Toàn bộ nội dung web do admin nhập.
- **Web vẫn chạy khi API lỗi.** Lớp dữ liệu của web có dữ liệu dự phòng (thông tin cửa hàng mặc định, danh sách rỗng) nên trang không sập; build web không cần API.

## 3. Luồng dữ liệu chính

### Khách xem sản phẩm
1. Server web gọi `GET /products`, `/categories`, `/settings`... (fetch có `revalidate: 300` và tag `catalog` / `content` / `settings`).
2. Trang được cache; tối đa 5 phút sau sẽ tự lấy lại dữ liệu mới.
3. Khi admin sửa dữ liệu, API gọi `POST {WEB_REVALIDATE_URL}` kèm `x-revalidate-secret` và danh sách tag → web xoá cache ngay, lần tải kế tiếp thấy dữ liệu mới.

### Khách đặt hàng
1. Giỏ hàng lưu ở `localStorage` trình duyệt (chỉ `variantId` + số lượng + bản chụp hiển thị).
2. Trang giỏ/thanh toán gọi thẳng `POST /orders/quote` từ trình duyệt → API trả giá hiện tại, dòng nào hết hàng/ngừng bán; giỏ tự cập nhật.
3. `POST /orders` → API báo giá lại, từ chối nếu có dòng không hợp lệ, lưu đơn cùng **bản chụp** tên/quy cách/giá của từng dòng, trả mã đơn `DH<yyMMdd><4 ký tự>`.
4. Khách tra cứu bằng `GET /orders/lookup?orderNumber=&phone=` (phải khớp cả mã đơn và số điện thoại).

Các lệnh ghi từ trình duyệt đi thẳng tới API (không qua server web) để giới hạn tần suất tính theo IP thật của khách.

### Chủ shop quản lý
1. Đăng nhập ở admin → Server Action gọi `POST /auth/login` → nhận JWT, lưu vào cookie `admin_token` (httpOnly, SameSite=Lax, Secure khi production).
2. Mọi trang/Server Action của admin gọi API phía server kèm `Authorization: Bearer <token>`; trình duyệt không bao giờ đọc được token.
3. API kiểm tra token **và** tra database mỗi request (tài khoản còn hoạt động, token cấp sau lần đổi mật khẩu gần nhất, vai trò đủ quyền).
4. Ảnh: admin chọn file → Server Action chuyển lên `POST /admin/uploads` → API kiểm tra chữ ký file (magic bytes), lưu `uploads/yyyy/mm/<ngẫu nhiên>.<ext>`, trả URL.

### Cập nhật realtime giữa web và admin
Dùng **Server-Sent Events** (SSE, một chiều máy chủ → trình duyệt, tự kết nối lại) — không cần thư viện hay dịch vụ ngoài. `RealtimeService` (`apps/api/src/realtime/`) giữ hai luồng sự kiện trong bộ nhớ:

| Luồng | Ai nghe | Sự kiện |
|---|---|---|
| `GET /events` (công khai) | Web khách hàng — `components/layout/live-updates.tsx` | `changed` + tag (`catalog` / `content` / `settings`). Không chứa dữ liệu, chỉ báo "nhóm này vừa đổi" |
| `GET /admin/events` (cần JWT) | Admin — qua route `/api/events` của admin (gắn token từ cookie rồi chuyển tiếp luồng) | `changed`, `order.created`, `order.updated`, `inquiry.created`, `inquiry.updated` |

Luồng xử lý:
- **Admin sửa dữ liệu** → `RevalidateService.notify(tag)`: báo ngay cho các trang admin khác đang mở → gọi web xoá cache → *sau khi* cache đã xoá mới phát `changed` cho khách (tránh khách tải lại mà vẫn nhận bản cũ). Trình duyệt khách chờ ngẫu nhiên 0,3–1,8 giây rồi `router.refresh()`: dữ liệu trang đổi, giỏ hàng/ô đang nhập giữ nguyên, không tải lại toàn trang. Tab đang ẩn thì đợi khách quay lại mới tải. Trang thanh toán báo giá lại giỏ hàng.
- **Khách đặt hàng / gửi liên hệ** → admin đang mở hiện thông báo góc màn hình kèm âm báo, số việc cần xử lý trên menu và trang đang xem tự cập nhật; tab ẩn thì tiêu đề tab hiện số việc mới, ví dụ `(2) Đơn hàng`.
- Mỗi 25 giây gửi `ping` để proxy không cắt kết nối im lặng. Kết nối admin được kiểm tra lại phiên mỗi 60 giây — tài khoản bị khoá / đổi mật khẩu thì luồng bị ngắt; trình duyệt nhận 401 thì tải lại trang và chuyển về đăng nhập.
- Rớt mạng / API khởi động lại: trình duyệt tự kết nối lại và tải lại dữ liệu một lần (có thể đã lỡ sự kiện).
- Giới hạn: luồng nằm trong bộ nhớ một tiến trình API — đủ cho một instance. Chạy nhiều instance API thì cần thay `Subject` bằng Redis pub/sub.

## 4. Bảo mật tóm tắt

| Nguy cơ | Biện pháp |
|---|---|
| Dò mật khẩu admin | Khoá tài khoản 15 phút sau 5 lần sai; giới hạn 10 lần đăng nhập/phút/IP; bcrypt |
| Token bị lộ / nhân viên nghỉ việc | Khoá tài khoản hoặc đổi mật khẩu → mọi token cũ mất hiệu lực ngay (kiểm tra DB mỗi request) |
| XSS lấy token | Token nằm trong cookie httpOnly của admin, không có trong JavaScript |
| Nhân viên truy cập dữ liệu doanh thu | `@Auth('ADMIN')` ở API cho thống kê, cài đặt, tài khoản; admin ẩn menu và chặn trang |
| Sửa giá từ trình duyệt | API tự tính giá; đơn lưu bản chụp giá tại thời điểm đặt |
| Spam đơn / form liên hệ | Giới hạn tần suất theo IP + trường bẫy `website` (honeypot) |
| Tải file độc hại | Chỉ JPG/PNG/WEBP/GIF, tối đa 5 MB, kiểm tra magic bytes, tên file ngẫu nhiên |
| Dữ liệu sai định dạng | `ValidationPipe` (whitelist + forbidNonWhitelisted) — trường lạ bị từ chối |
