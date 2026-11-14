# Cây thư mục

```
frozen-fruit-shop/
├── apps/
│   ├── web/                 # Website khách hàng (Next.js) — xem 03-apps/web.md
│   ├── admin/               # Trang quản trị (Next.js) — xem 03-apps/admin.md
│   └── api/                 # Backend NestJS + Prisma — xem 03-apps/api.md, database.md
├── packages/
│   └── types/               # Hợp đồng dữ liệu dùng chung cho cả 3 app
├── deploy/                  # Docker Compose production, Dockerfile, Caddyfile, backup.sh
├── design/                  # Bảng màu, bản thiết kế HTML tham khảo
├── docs/                    # Tài liệu — mục lục ở docs/README.md
│   ├── 01-product/          # Tổng quan, tính năng, thông tin cửa hàng
│   ├── 02-architecture/     # Kiến trúc, luồng hoạt động, bảo mật, cây thư mục
│   ├── 03-apps/             # web, admin, api, database
│   ├── 04-operations/       # Chạy máy dev, triển khai, giám sát & sao lưu, CI/CD
│   ├── 05-roadmap/          # Lộ trình, checklist production, quyết định kỹ thuật
│   ├── 06-testing/          # Kịch bản test thủ công + lỗi phát hiện
│   └── archive/             # Kế hoạch cũ (lỗi thời)
├── .github/workflows/       # CI (lint + build khi mở PR vào main)
├── docker-compose.yml       # PostgreSQL cho máy dev (cổng 5434)
└── package.json             # npm workspaces + lệnh chung
```

Đây là **npm workspaces monorepo**: `npm install` ở gốc cài cho mọi app; app import package nội bộ như package npm thường (`@frozen-fruit-shop/types`). `apps/` là ứng dụng chạy độc lập; `packages/` là thư viện dùng chung, không tự chạy.

## `packages/types`

`src/index.ts` chứa:
- Kiểu dữ liệu API trả về/nhận vào (Product, Order, SiteSettings, DashboardStats...).
- Nhãn tiếng Việt cho trạng thái (`ORDER_STATUS_LABELS`, `STOCK_STATUS_LABELS`...), để web và admin hiển thị giống nhau.
- `DEFAULT_SITE_SETTINGS` — thông tin thật của cửa hàng, dùng khi database chưa có cài đặt hoặc API không phản hồi.
- `formatPhone()`.

Build ra CommonJS trong `dist/` (tự chạy ở `postinstall`). Sửa file này → chạy `npm run build:packages`.

## `apps/web`

```
src/
├── app/                     # Mỗi thư mục = một trang (App Router); api/revalidate = route làm mới cache
├── components/
│   ├── layout/              # header, footer, logo, nút liên hệ nổi, live-updates (realtime)
│   ├── home/                # khối trang chủ (banner, danh mục, nổi bật, bài viết)
│   ├── product/             # thẻ, lưới, ảnh, giá, thư viện ảnh, form thêm giỏ
│   ├── checkout/, contact/, post/
│   └── ui/                  # thành phần không gắn nghiệp vụ (button, container, form)
├── lib/
│   ├── api.ts               # đọc dữ liệu phía server (cache + dự phòng)
│   ├── api-client.ts        # gọi API từ trình duyệt (báo giá, đặt hàng, tra cứu, liên hệ)
│   ├── cart-context.tsx     # giỏ hàng
│   └── format.ts, ...
└── types/                   # type chỉ dùng ở web (CartItem)
public/images/               # logo, ảnh hero, ảnh placeholder, banner tĩnh trang sản phẩm
```

## `apps/admin`

```
src/
├── app/
│   ├── login/, logout/      # đăng nhập / đăng xuất (route xoá cookie)
│   ├── api/events/          # chuyển tiếp luồng realtime của API (gắn token từ cookie)
│   └── (dashboard)/         # mọi trang cần đăng nhập, dùng chung layout có thanh bên
│       ├── page.tsx         # Tổng quan (ADMIN)
│       ├── orders/, inquiries/, products/, categories/, banners/, posts/, policies/
│       ├── settings/, users/  # chỉ ADMIN
│       └── account/
│           # mỗi mục: page.tsx (danh sách), new/, [id]/, *-form.tsx (client), actions.ts (Server Actions)
├── components/
│   ├── layout/sidebar.tsx   # menu theo vai trò, số việc cần xử lý
│   ├── layout/live-updates.tsx  # nhận sự kiện realtime, thông báo đơn/liên hệ mới
│   └── ui/                  # Button, SubmitButton, Field, Section, Table, Badge, ImageUpload...
├── lib/
│   ├── api.ts               # api<T>() gọi API kèm token, runAction() cho Server Action
│   ├── auth.ts              # getCurrentUser(), requireAdmin()
│   ├── session.ts           # đọc/ghi cookie admin_token
│   ├── upload-action.ts     # Server Action tải ảnh
│   └── format.ts            # định dạng tiền/ngày, đọc FormData
└── proxy.ts                 # chặn trang khi chưa đăng nhập
```

## `apps/api`

```
prisma/
├── schema.prisma            # mô hình dữ liệu
├── migrations/              # lịch sử migration
├── create-admin.ts          # tạo / đặt lại mật khẩu ADMIN duy nhất
├── seed-test.ts             # máy dev: xoá sạch + nạp dữ liệu kiểm thử (npm run db:seed:test)
└── seed-assets/             # ảnh mẫu cho seed
src/                         # xem 03-apps/api.md mục 6
uploads/                     # ảnh tải lên (không commit)
```

## Quy tắc khi thêm code

- Kiểu dữ liệu trao đổi giữa các app → `packages/types`, không khai báo lại trong app.
- Nghiệp vụ và kiểm tra quyền → API. Web/admin chỉ hiển thị và gọi API.
- Component chỉ dùng cho một tính năng → thư mục theo tính năng; dùng nhiều nơi, không gắn nghiệp vụ → `ui/`.
- Admin: trang mới đặt trong `(dashboard)/`, thao tác ghi viết thành Server Action trong `actions.ts`, bọc `runAction()`.
- Sửa `schema.prisma` → `npm run db:migrate` và commit thư mục migration mới.
