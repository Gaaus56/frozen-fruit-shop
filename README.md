# Frozen Fruit Shop

Website bán trái cây đông lạnh — monorepo gồm frontend khách hàng (Next.js), trang quản trị (Next.js) và backend (NestJS + PostgreSQL).

## Cấu trúc thư mục

```
frozen-fruit-shop/
├── apps/
│   ├── web/      # Frontend Next.js (storefront khách hàng)
│   ├── admin/     # Frontend Next.js (trang quản trị — chủ cửa hàng đăng nhập để quản lý sản phẩm/danh mục/bài viết)
│   └── api/        # Backend NestJS + Prisma (REST API dùng chung cho web và admin)
├── packages/
│   ├── types/       # Type TypeScript dùng chung (Product, Category, Order...)
│   └── fixtures/    # Dữ liệu mẫu dùng chung (nội dung catalog cho web + seed cho DB)
├── docs/
│   ├── plan/    # Tài liệu kế hoạch dự án
│   └── guide/    # Tài liệu hướng dẫn kỹ thuật (giải thích cây thư mục...)
└── docker-compose.yml  # PostgreSQL cho môi trường dev cục bộ
```

Đây là npm workspaces monorepo: mỗi thư mục trong `apps/` và `packages/` là một package riêng, cài đặt qua một lệnh `npm install` duy nhất ở thư mục gốc. Xem [docs/guide/folder-structure.md](docs/guide/folder-structure.md) để hiểu chi tiết vì sao repo được tổ chức như vậy.

## Bắt đầu

### 1. Cài đặt dependencies (toàn bộ workspace)

```bash
npm install
```

Lệnh này tự động build `packages/types` và `packages/fixtures` (qua hook `postinstall`).

### 2. Chạy frontend khách hàng (dùng dữ liệu mẫu tĩnh, không cần database)

```bash
npm run dev:web
```

Mở http://localhost:3000. Hiện tại `apps/web` render trực tiếp từ `packages/fixtures` để luôn chạy được ngay không phụ thuộc database — phù hợp giai đoạn demo/MVP hiện tại.

### 3. Chạy backend + database (cần cho trang quản trị)

```bash
npm run db:up        # khởi động PostgreSQL qua Docker (cổng 5434)
cp apps/api/.env.example apps/api/.env
npm run db:migrate   # tạo schema
npm run db:seed      # nạp dữ liệu mẫu + tạo tài khoản admin đầu tiên (từ ADMIN_EMAIL/ADMIN_PASSWORD trong .env)
npm run dev:api
```

API chạy tại http://localhost:4000. Endpoint đọc công khai, endpoint ghi cần đăng nhập:

| Endpoint | Công khai (GET) | Cần đăng nhập (POST/PATCH/DELETE) |
|---|---|---|
| `/products`, `/products/:slug` | ✅ | ✅ |
| `/categories`, `/categories/:slug` | ✅ | ✅ |
| `/blog-posts`, `/blog-posts/:slug` | ✅ | ✅ |
| `/auth/login` | — | (dùng để lấy JWT) |

Xem `apps/api/.env.example` để biết các biến môi trường cần thiết (bao gồm `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).

### 4. Chạy trang quản trị (cần backend + database đang chạy)

```bash
cp apps/admin/.env.example apps/admin/.env.local
npm run dev:admin
```

Mở http://localhost:3002, đăng nhập bằng `ADMIN_EMAIL`/`ADMIN_PASSWORD` đã khai báo khi seed. Xem chi tiết ở `docs/plan/07-admin-panel.md`.

## Trạng thái tích hợp frontend ↔ backend

- `apps/admin` **đã** gọi `apps/api` thật (đọc + ghi dữ liệu qua JWT) — đây là luồng dữ liệu chính cho việc quản lý nội dung.
- `apps/web` (storefront khách hàng) **chưa** gọi API — vẫn đọc trực tiếp từ `packages/fixtures` để trang luôn chạy được kể cả khi chưa có database (ưu tiên demo/CI không phụ thuộc hạ tầng). Bước tiếp theo hợp lý: thêm lớp `api-client` trong `apps/web` gọi `apps/api` khi có biến môi trường tương ứng, giữ fixtures làm fallback.

## Tài liệu

- `docs/plan/` — phạm vi tính năng, sitemap, mô hình dữ liệu, tech stack, roadmap, kế hoạch trang quản trị.
- `docs/guide/` — tài liệu kỹ thuật, bắt đầu từ `folder-structure.md`.
