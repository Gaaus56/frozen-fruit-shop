# Web — website khách hàng (`apps/web`)

Next.js 16 (App Router) + React 19 + Tailwind 4, cổng 3000. Dữ liệu lấy từ API (cache 5 phút theo tag, được xoá ngay khi admin sửa); mọi thao tác ghi (báo giá, đặt hàng, tra cứu, liên hệ, bình luận) gọi thẳng API từ trình duyệt.

| Route | Tài liệu | Ghi chú |
|---|---|---|
| (mọi trang) | [shared.md](shared.md) | Header, Footer, nút liên hệ nổi, cập nhật realtime, thư mục dùng chung |
| `/` | [home.md](home.md) | Banner, danh mục, sản phẩm nổi bật, tin tức, khối trang chủ |
| `/products` | [products.md](products.md) | Lọc theo danh mục, tìm kiếm, sắp xếp |
| `/products/[slug]` | [product-detail.md](product-detail.md) | Ảnh, chọn quy cách, thẻ cam kết, mô tả |
| `/cart` | [cart.md](cart.md) | Giỏ hàng lưu `localStorage` |
| `/checkout` | [checkout.md](checkout.md) | Đặt hàng COD, bill xuất ra ngay |
| `/order-lookup` | [order-lookup.md](order-lookup.md) | Tra cứu đơn, bill đã lưu trên máy |
| `/about` | [about.md](about.md) | Nội dung do admin soạn |
| `/contact` | [contact.md](contact.md) | Form liên hệ, thông tin, bản đồ |
| `/news` | [news.md](news.md) | Kiến thức / Tuyển dụng |
| `/news/[slug]` | [news-detail.md](news-detail.md) | Mục lục, sản phẩm nhúng, bình luận |
| `/policies/[slug]` | [policy-detail.md](policy-detail.md) | Trang chính sách |

Đã gỡ so với bản cũ: trang `/wholesale` (đặt hàng sỉ), phương thức chuyển khoản ở `/checkout`.
