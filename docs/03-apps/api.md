# Backend API (`apps/api`)

NestJS 12 (ESM) + Prisma 6, cổng 4000. Mã nguồn chia theo module nghiệp vụ trong `src/`.

## 1. Quy ước chung

- JSON vào/ra; tiền là số nguyên (đồng); thời gian ISO 8601.
- Route công khai: `/<tài nguyên>`. Route quản trị: `/admin/<tài nguyên>`, cần header `Authorization: Bearer <JWT>`.
- Danh sách phân trang trả `{ items, total, page, pageSize }` (tham số `page`, `pageSize`).
- Lỗi trả `{ statusCode, message }`, `message` bằng tiếng Việt, hiển thị thẳng cho người dùng được.

| Mã | Khi nào |
|---|---|
| 400 | Dữ liệu không hợp lệ (sai định dạng, thiếu trường, trường lạ, chuyển trạng thái không hợp lệ) |
| 401 | Chưa đăng nhập, token hết hạn, tài khoản bị khoá, token cấp trước lần đổi mật khẩu |
| 403 | Đăng nhập rồi nhưng không đủ quyền (STAFF gọi route chỉ dành cho ADMIN) |
| 404 | Không tìm thấy |
| 409 | Trùng dữ liệu (slug, email, SKU) hoặc vướng ràng buộc (xoá danh mục còn sản phẩm) |
| 429 | Vượt giới hạn tần suất |

## 2. Xác thực và phân quyền

- `POST /auth/login` trả `{ accessToken, expiresAt, user }`. JWT chứa `sub` (id) và `role`, ký bằng `JWT_SECRET`, hạn `JWT_EXPIRES_IN`.
- Decorator `@Auth()` (mọi tài khoản đăng nhập) / `@Auth('ADMIN')` (chỉ ADMIN) ở `src/auth/auth.guard.ts`. Guard xác minh chữ ký **và** đọc user từ database mỗi request: không tồn tại, `isActive = false`, hoặc token cấp trước `passwordChangedAt` → 401.
- Đăng nhập sai 5 lần → khoá 15 phút. Thông báo lỗi không tiết lộ email có tồn tại hay không.

## 3. Giới hạn tần suất (theo IP)

| Endpoint | Giới hạn |
|---|---|
| `POST /auth/login` | 10 lần / 60 giây |
| `POST /orders/quote` | 60 / 60 giây |
| `POST /orders` | 5 / 10 phút |
| `GET /orders/lookup` | 20 / 60 giây |
| `POST /inquiries` | 5 / 10 phút |
| `POST /admin/uploads` | 60 / 60 giây |

Bộ đếm nằm trong bộ nhớ tiến trình (đủ cho một máy chủ). API đặt `trust proxy = 1` để đọc IP thật sau Caddy. Lưu ý: đăng nhập và tải ảnh của admin đi qua server admin nên dùng chung một IP — 10 lần đăng nhập/phút là tổng cho cả cửa hàng, đủ dùng cho vài nhân viên.

## 4. Endpoint công khai

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/health` | Kiểm tra sống |
| GET | `/settings` | Thông tin cửa hàng |
| GET | `/categories` | Danh mục đang hiển thị (kèm số sản phẩm) |
| GET | `/products` | Sản phẩm đang bán. Lọc: `category` (slug), `q`, `featured=true`, `sort` (default/newest/price_asc/price_desc), `limit` |
| GET | `/products/:slug` | Chi tiết + `relatedProducts` |
| GET | `/posts` | Bài đã đăng (`limit`, `type` = knowledge / recruitment) |
| GET | `/posts/:slug` | Chi tiết bài |
| GET | `/pages/:slug` | Trang nội dung (`about`). Chưa lưu → nội dung mặc định, `updatedAt: null` |
| GET | `/banners` | Banner đang bật. `?placement=home` (mặc định), `products` hoặc `news` |
| GET | `/policies` · `/policies/:slug` | Chính sách đang bật |
| POST | `/orders/quote` | `{ items: [{ variantId, quantity }] }` → giá hiện tại từng dòng, dòng không khả dụng, tạm tính |
| POST | `/orders` | Tạo đơn: `items`, `customerName`, `customerPhone`, `customerEmail?`, `shippingAddress`, `customerNote?`, `paymentMethod` (cod/bank_transfer), `website` (honeypot). Trả `{ orderNumber, total }` |
| GET | `/orders/lookup?orderNumber=&phone=` | Tra cứu đơn (phải khớp cả hai) |
| POST | `/inquiries` | Liên hệ: `type` (chỉ `contact`), `name`, `phone`, `email`, `message`, `website` |
| GET | `/events` | Luồng SSE: `{ type: "changed", tags }` khi dữ liệu hiển thị trên web thay đổi (xem [request-flows.md](../02-architecture/request-flows.md#5-cập-nhật-realtime)) |

Phí vận chuyển của đơn mới là 0 — cửa hàng gọi khách xác nhận rồi nhập phí ở trang quản trị.

## 5. Endpoint quản trị

Tất cả cần đăng nhập. Cột **Quyền**: *Tất cả* = ADMIN và STAFF.

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| GET | `/auth/me` | Tất cả | Người đang đăng nhập |
| POST | `/auth/change-password` | Tất cả | `{ currentPassword, newPassword }` → token mới |
| GET | `/admin/stats?days=7\|30\|90\|365` | ADMIN | Số liệu trang Tổng quan |
| GET · PUT | `/admin/settings` | GET: Tất cả · PUT: ADMIN | Thông tin cửa hàng |
| GET · POST | `/admin/users` | ADMIN | Danh sách tài khoản · tạo STAFF `{ email, name, password }` |
| PATCH · DELETE | `/admin/users/:id` | ADMIN | Sửa `{ name?, isActive? }` · xoá STAFF |
| POST | `/admin/users/:id/reset-password` | ADMIN | `{ password }` — đăng xuất nhân viên khỏi mọi thiết bị |
| GET | `/admin/orders` | Tất cả | Lọc `status`, `q` (mã đơn/tên/SĐT), `from`, `to`; phân trang |
| GET · PATCH | `/admin/orders/:id` | Tất cả | Chi tiết · cập nhật `status`, `paymentStatus`, `shippingFee`, `discount`, `internalNote`, `note` (ghi vào lịch sử) |
| GET | `/admin/inquiries` | Tất cả | Lọc `type`, `status`; phân trang |
| PATCH · DELETE | `/admin/inquiries/:id` | Tất cả | Đổi trạng thái · xoá |
| GET · POST | `/admin/categories` | Tất cả | Danh sách (cả ẩn) · tạo |
| GET · PATCH · DELETE | `/admin/categories/:id` | Tất cả | Xoá bị từ chối (409) nếu còn sản phẩm |
| GET · POST | `/admin/products` | Tất cả | Lọc `q`, `categoryId`, `status` (active/inactive/all) · tạo |
| GET · PATCH · DELETE | `/admin/products/:id` | Tất cả | PATCH nhận `images: [{ url }]` (thay toàn bộ, theo thứ tự) và `variants` (có `id` = sửa, không có = thêm, thiếu = xoá) |
| CRUD | `/admin/posts`, `/admin/banners`, `/admin/policies` | Tất cả | Tương tự |
| GET · PUT | `/admin/pages/:slug` | Tất cả | Trang Giới thiệu `{ title, description, content }` |
| POST | `/admin/uploads` | Tất cả | `multipart/form-data`, trường `file`; JPG/PNG/WEBP/GIF ≤ 5 MB → `{ url }` |

Mọi thao tác ghi dữ liệu hiển thị trên web gọi `RevalidateService.notify(tag)` → web làm mới cache ngay, rồi phát sự kiện realtime cho trình duyệt đang mở.

`GET /admin/events` (Tất cả) — luồng SSE cho trang quản trị: `changed`, `order.created`, `order.updated`, `inquiry.created`, `inquiry.updated`. Kiểu sự kiện: `AdminRealtimeEvent` trong `packages/types`.

## 6. Nội dung có định dạng (HTML)

`content` của bài viết / chính sách / trang, `description` của sản phẩm là **HTML** do trình soạn thảo admin tạo. API **không tin** HTML gửi lên: `common/rich-text.ts` (`sanitize-html`) chỉ giữ

`p h2 h3 strong em u s br hr ul ol li blockquote` · `a[href]` (http(s), mailto, tel, "/…"; link ngoài thêm `target=_blank rel=noopener`) · `figure > img[src,alt] + figcaption` (ảnh `/uploads/…` hoặc http(s)) · `aside[data-tone=green|red]` · `div[data-product-slug]` (ô sản phẩm).

Mọi thứ khác (`script`, `style`, `on*`, `javascript:`, class, màu…) bị bỏ. Ảnh của API lưu dạng tương đối `/uploads/…`, trả ra kèm `PUBLIC_URL` — đổi tên miền không hỏng ảnh trong bài. Nội dung cũ dạng chữ thường được chuyển sang `<p>` khi đọc / lưu.

## 7. Cấu trúc mã

```
src/
├── main.ts                 # khởi tạo: trust proxy, header bảo mật, CORS, /uploads tĩnh, ValidationPipe, filter lỗi Prisma
├── app.module.ts           # ghép module + GET /health
├── config/env.ts           # đọc & kiểm tra biến môi trường (dùng process.loadEnvFile, không cần dotenv)
├── common/                 # rich-text.ts (lọc HTML), tiện ích (slugify, URL ảnh, chuẩn hoá SĐT), validator, phân trang, rate-limit guard, filter lỗi Prisma
├── prisma/                 # PrismaService
├── auth/                   # đăng nhập, /auth/me, đổi mật khẩu, guard + decorator @Auth
├── users/                  # quản lý tài khoản nhân viên (ADMIN)
├── categories/             # danh mục (public + admin)
├── products/               # sản phẩm, ảnh, quy cách
├── orders/                 # báo giá, đặt hàng, tra cứu, quản lý đơn
├── inquiries/              # liên hệ
├── content/                # posts, banners, policies, pages (trang Giới thiệu), settings
├── uploads/                # tải ảnh
├── stats/                  # số liệu Tổng quan (ADMIN)
├── realtime/               # luồng sự kiện SSE: GET /events, GET /admin/events
└── revalidate/             # báo web xoá cache, rồi phát sự kiện "changed"
```

Script `prisma/create-admin.ts`: tạo ADMIN duy nhất từ `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME` (mật khẩu ≥ 12 ký tự), hoặc đặt lại mật khẩu nếu ADMIN đã tồn tại với cùng email.
