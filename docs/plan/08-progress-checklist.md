# 08. Checklist tiến độ

> Cập nhật thủ công khi có thay đổi lớn. Xem chi tiết từng phần ở các file kế hoạch tương ứng.

## Storefront khách hàng (`apps/web`)

- [x] Trang chủ, danh mục, chi tiết sản phẩm
- [x] Giỏ hàng (lưu localStorage)
- [x] Trang Giới thiệu, Liên hệ, Đặt hàng sỉ, Tin tức
- [x] Các trang chính sách
- [x] Responsive mobile
- [ ] Checkout thật (thanh toán, tạo đơn hàng) — hiện là trang placeholder
- [ ] Tài khoản khách hàng (đăng ký/đăng nhập, lịch sử đơn hàng, wishlist)
- [ ] Đánh giá sản phẩm (review)
- [ ] Mã giảm giá/voucher
- [ ] **Gọi dữ liệu thật từ `apps/api`** — hiện vẫn đọc từ `packages/fixtures` tĩnh, chưa đồng bộ với dữ liệu admin sửa

## Backend (`apps/api`)

- [x] Prisma schema (Product, Category, BlogPost, Order, Customer, DeliveryZone, AdminUser)
- [x] CRUD sản phẩm, danh mục, bài viết (GET công khai, ghi cần đăng nhập)
- [x] Đăng nhập admin (JWT)
- [x] Seed dữ liệu mẫu từ `packages/fixtures`
- [ ] Module đơn hàng (`orders`) — có schema, chưa có API
- [ ] Module khách hàng (`customers`) — có schema, chưa có API
- [ ] Module thanh toán (payments) — VNPay/MoMo/ZaloPay
- [ ] Kiểm tra khu vực giao hàng (`delivery-zones`) — có schema, chưa có API
- [ ] Upload ảnh trực tiếp (hiện nhập bằng đường dẫn text)

## Trang quản trị (`apps/admin`)

- [x] Đăng nhập, bảo vệ route
- [x] CRUD sản phẩm (kèm biến thể đóng gói), danh mục, bài viết
- [ ] Quản lý đơn hàng
- [ ] Nhiều tài khoản quản trị / phân quyền
- [ ] Upload ảnh trực tiếp

## Hạ tầng & vận hành

- [x] Docker Compose PostgreSQL cho dev
- [x] Monorepo npm workspaces (`apps/`, `packages/`)
- [ ] CI/CD (GitHub Actions)
- [ ] Triển khai thật (hosting web/admin/api, database managed)
- [ ] Domain, SSL, giám sát lỗi (Sentry/uptime)

## Việc ưu tiên tiếp theo (đề xuất)

1. Nối `apps/web` gọi `apps/api` thay vì đọc `packages/fixtures` tĩnh — khép kín vòng dữ liệu admin ↔ khách hàng.
2. Module `orders` ở backend + luồng checkout thật ở `apps/web`.
3. Upload ảnh trực tiếp thay vì nhập đường dẫn.
