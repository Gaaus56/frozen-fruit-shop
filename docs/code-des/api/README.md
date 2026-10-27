# API — backend (`apps/api`)

NestJS (ESM) + Prisma + PostgreSQL, cổng 4000. Toàn bộ nghiệp vụ và phân quyền nằm ở đây.

| Module | Tài liệu | Đường dẫn chính |
|---|---|---|
| Khởi động & nền tảng | [core.md](core.md) | `/health`, bảo mật header, CORS, validation, rate limit, rich text |
| Xác thực | [auth.md](auth.md) | `/auth/*` — đăng nhập, OTP |
| Nhân viên | [users.md](users.md) | `/admin/users` (ADMIN) |
| Danh mục | [categories.md](categories.md) | `/categories`, `/admin/categories` |
| Sản phẩm | [products.md](products.md) | `/products`, `/admin/products` |
| Đơn hàng | [orders.md](orders.md) | `/orders`, `/admin/orders` |
| Liên hệ | [inquiries.md](inquiries.md) | `/inquiries`, `/admin/inquiries` |
| Bình luận | [comments.md](comments.md) | `/posts/:slug/comments`, `/admin/comments` |
| Nội dung | [content.md](content.md) | banners, posts, policies, pages, home-blocks, settings |
| Tải ảnh | [uploads.md](uploads.md) | `/admin/uploads` |
| Thống kê | [stats.md](stats.md) | `/admin/stats` (ADMIN) |
| Lịch sử | [audit.md](audit.md) | `/admin/audit-logs` (ADMIN) |
| Realtime | [realtime.md](realtime.md) | `/events`, `/admin/events` (SSE) |
| Xoá cache web | [revalidate.md](revalidate.md) | nội bộ |
| Database | [database.md](database.md) | Prisma schema, migration, script |

Thêm so với bản cũ: `comments`, `audit`, `users` có phân quyền + OTP, OTP trong `auth`, xuất Excel đơn hàng, `pages` / `home-blocks`. Đã gỡ: báo giá sỉ (`wholesale`), thanh toán chuyển khoản (`bank_transfer`).
