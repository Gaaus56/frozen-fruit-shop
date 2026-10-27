# Admin — trang quản trị (`apps/admin`)

Next.js 16, cổng 3002. Đăng nhập bằng cookie httpOnly chứa JWT; mọi dữ liệu đi qua API. Mục nào cũng có hai tầng kiểm tra: `requirePermission` / `requireAdmin` ở trang và `@Auth` / `@Permission` ở API.

| Nhóm menu | Route | Tài liệu | Quyền |
|---|---|---|---|
| (chung) | — | [shared.md](shared.md) | — |
| (chung) | `/login` | [login.md](login.md) | công khai |
| Bán hàng | `/` | [dashboard.md](dashboard.md) | ADMIN |
| Bán hàng | `/orders`, `/orders/[id]` | [orders.md](orders.md) | `orders` |
| Bán hàng | `/inquiries` | [inquiries.md](inquiries.md) | `inquiries` |
| Sản phẩm | `/products` | [products.md](products.md) | `products` |
| Sản phẩm | `/categories` | [categories.md](categories.md) | `categories` |
| Nội dung web | `/preview` | [preview.md](preview.md) | ADMIN |
| Nội dung web | `/banners` | [banners.md](banners.md) | `banners` |
| Nội dung web | `/home-blocks` | [home-blocks.md](home-blocks.md) | `homeBlocks` |
| Nội dung web | `/posts` | [posts.md](posts.md) | `posts` |
| Nội dung web | `/comments` | [comments.md](comments.md) | `comments` |
| Nội dung web | `/pages/about` | [pages.md](pages.md) | `pages` |
| Nội dung web | `/policies` | [policies.md](policies.md) | `policies` |
| Nội dung web | `/settings` | [settings.md](settings.md) | ADMIN |
| Hệ thống | `/users` | [users.md](users.md) | ADMIN |
| Hệ thống | `/activity` | [activity.md](activity.md) | ADMIN |
| Hệ thống | `/account` | [account.md](account.md) | mọi tài khoản |

Thêm so với bản cũ: Xem trước & sửa, Khối trang chủ, Bình luận, Trang Giới thiệu, Lịch sử chỉnh sửa, phân quyền nhân viên, xuất Excel đơn hàng, OTP. Đã gỡ: ô "mua sỉ" ở sản phẩm, thông tin chuyển khoản ở Thông tin cửa hàng.
