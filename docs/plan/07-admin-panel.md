# 07. Trang quản trị (Admin Panel)

> Bổ sung sau khi đã có storefront cơ bản. Ghi nhận thay đổi phạm vi: ban đầu dự án chủ định **chỉ làm phía khách hàng** (xem `00-overview.md`), dựa trên giả định sẽ dùng một nền tảng/CMS có sẵn để quản lý dữ liệu. Sau khi quyết định tự xây backend (NestJS + Prisma, xem `02-tech-stack.md`), lựa chọn tự nhiên tiếp theo là tự xây luôn một trang quản trị nhỏ thay vì phụ thuộc công cụ ngoài — vì dữ liệu đã nằm trong database riêng, không nền tảng có sẵn nào quản lý hộ được nữa.

## 1. Mục tiêu

Cho phép **chủ cửa hàng** (không rành kỹ thuật) tự cập nhật:
- Thông tin sản phẩm: tên, mô tả, ảnh, giá theo từng quy cách đóng gói, tồn kho, thông tin bảo quản.
- Danh mục sản phẩm.
- Bài viết blog/tin tức.

Không nhắm tới việc thay thế các công cụ vận hành phức tạp (kế toán, quản lý kho đa chi nhánh...) — chỉ đủ để chủ shop tự vận hành nội dung/sản phẩm hàng ngày mà không cần nhờ dev.

## 2. Phạm vi (MVP)

### Có trong v1
- Đăng nhập bằng tài khoản quản trị (1 tài khoản, chưa cần phân quyền nhiều cấp).
- Quản lý sản phẩm: xem danh sách, thêm/sửa/xoá, quản lý biến thể đóng gói (giá, tồn kho) theo từng sản phẩm.
- Quản lý danh mục: xem danh sách, thêm/sửa/xoá.
- Quản lý bài viết: xem danh sách, thêm/sửa/xoá.
- Ảnh sản phẩm/bài viết: nhập **đường dẫn ảnh** (text), chưa có upload file trực tiếp (xem mục 5).

### Chưa làm ở v1 (giai đoạn sau)
- Quản lý đơn hàng (chưa có luồng đặt hàng thật ở storefront nên chưa cần).
- Nhiều tài khoản quản trị / phân quyền theo vai trò.
- Upload ảnh trực tiếp (kéo-thả, resize tự động).
- Thống kê doanh thu/dashboard số liệu.
- Quản lý khu vực giao hàng, mã giảm giá.

## 3. Kiến trúc

Thêm một app mới trong monorepo: `apps/admin` (Next.js), độc lập với `apps/web` — không dùng chung route, không lộ ra ngoài cho khách hàng, có thể triển khai ở một domain/subdomain riêng (vd. `admin.frozenfruitshop.vn`) và giới hạn truy cập ở tầng hạ tầng nếu cần (Cloudflare Access, VPN nội bộ...).

```
Chủ cửa hàng
     │
     ▼
apps/admin (Next.js) ──── đăng nhập (JWT) ────▶ apps/api
     │                                              │
     └── form thêm/sửa sản phẩm, danh mục, bài viết ─┘
                                                      ▼
                                                PostgreSQL
```

`apps/admin` không truy cập database trực tiếp — mọi thao tác đều gọi qua `apps/api` (cùng một API mà `apps/web` sẽ dùng), đảm bảo một nguồn logic nghiệp vụ duy nhất (validate dữ liệu, ràng buộc...).

## 4. Xác thực (Authentication)

- `apps/api` có thêm module `auth`: một bảng `AdminUser` (email + mật khẩu đã hash) trong database, endpoint `POST /auth/login` trả về JWT.
- Các endpoint tạo/sửa/xoá (POST/PATCH/DELETE) của `products`, `categories`, `blog-posts` được bảo vệ bởi JWT Guard — chỉ endpoint đọc (GET) là công khai (để `apps/web` dùng được mà không cần đăng nhập).
- `apps/admin` lưu JWT trong cookie `httpOnly`, dùng middleware để chặn truy cập các trang `/admin/*` khi chưa đăng nhập.
- Tài khoản quản trị đầu tiên được tạo qua seed script (email/mật khẩu đặt trong biến môi trường), chưa làm màn hình "đăng ký" công khai — hợp lý vì chỉ có 1 chủ cửa hàng ở giai đoạn này.

## 5. Về việc nhập ảnh bằng đường dẫn (thay vì upload)

Ở v1, người quản trị nhập đường dẫn ảnh (ví dụ tự upload ảnh lên một dịch vụ ảnh miễn phí rồi dán link, hoặc dùng ảnh đã có sẵn trong `apps/web/public/images`). Lý do đơn giản hoá: xây dựng upload ảnh thật cần thêm hạ tầng lưu trữ (S3/Cloudinary) và xử lý resize/tối ưu ảnh — không phải phần khó nhất của bài toán "chủ shop tự cập nhật sản phẩm", nên để lại giai đoạn sau khi phần quản lý dữ liệu cốt lõi đã ổn định.

## 6. Cấu trúc thư mục dự kiến cho `apps/admin`

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── login/                 # Trang đăng nhập
│   │   └── (dashboard)/           # Nhóm route cần đăng nhập
│   │       ├── san-pham/           # Danh sách + thêm/sửa sản phẩm
│   │       ├── danh-muc/            # Danh sách + thêm/sửa danh mục
│   │       └── bai-viet/             # Danh sách + thêm/sửa bài viết
│   ├── components/                 # Form, bảng dữ liệu, layout admin
│   ├── lib/                          # api-client gọi apps/api, xử lý auth cookie
│   └── middleware.ts                  # Chặn truy cập khi chưa đăng nhập
└── package.json
```

## 7. Việc cần làm ở `apps/api` để hỗ trợ admin

- Thêm module `auth` (login, JWT guard).
- Thêm model `AdminUser` vào `schema.prisma` + migration + seed tài khoản đầu tiên.
- Bổ sung endpoint ghi dữ liệu (POST/PATCH/DELETE) cho `products`, `categories`, `blog-posts` — hiện tại các module này mới chỉ có GET.
- Thêm validate dữ liệu đầu vào (class-validator DTO) để tránh admin nhập sai dạng dữ liệu làm hỏng storefront.
