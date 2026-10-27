# Trái Cây Đông Lạnh Đà Nẵng 28

Website bán trái cây đông lạnh gồm trang khách hàng, trang quản trị và backend API dùng chung, tổ chức thành monorepo bằng npm workspaces.

```
apps/
├── web/      # Website khách hàng (Next.js 16, :3000)      → apps/web/README.md
├── admin/    # Trang quản trị (Next.js 16, :3002)          → apps/admin/README.md
└── api/      # Backend (NestJS + Prisma + PostgreSQL, :4000) → apps/api/README.md
packages/
└── types/    # Kiểu dữ liệu dùng chung giữa web / admin / api
deploy/       # Dockerfile + Docker Compose + Caddy (Render dùng deploy/api.Dockerfile)
```

## Bắt đầu nhanh

Cần Node 22 và Docker (cho PostgreSQL).

```bash
npm install                 # cài thư viện + build packages/types
npm run db:up               # PostgreSQL qua Docker, cổng 5434

cp apps/api/.env.example apps/api/.env               # điền ADMIN_EMAIL / ADMIN_PASSWORD, JWT_SECRET
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local

npm run db:deploy           # tạo bảng
npm run admin:create        # tạo tài khoản quản trị

npm run dev:api             # http://localhost:4000
npm run dev:web             # http://localhost:3000
npm run dev:admin           # http://localhost:3002
```

Database ban đầu **rỗng**. Đăng nhập trang quản trị rồi nhập lần lượt: thông tin cửa hàng → danh mục → sản phẩm → banner → chính sách → bài viết. Muốn có dữ liệu mẫu trên máy dev: `npm run db:seed:test` (lệnh này **xoá sạch** DB rồi nạp lại).

## Lệnh thường dùng

| Lệnh | Việc |
|---|---|
| `npm run lint:web` · `npm run lint:admin` | Kiểm tra code |
| `npm run build:web` · `build:admin` · `build:api` | Build production |
| `npm run build:packages` | Build lại `packages/types` sau khi sửa kiểu |
| `npm run db:deploy` | Áp migration (không xoá dữ liệu) |
| `npm run db:studio` | Xem / sửa dữ liệu bằng Prisma Studio |

## Triển khai

- **Bản demo:** web và admin trên Vercel (Root Directory `apps/web`, `apps/admin`), API trên Render (Dockerfile `deploy/api.Dockerfile`, tự chạy `prisma migrate deploy` khi khởi động), database Neon. Tự deploy khi push nhánh `demo`.
- **Production (VPS):** xem [deploy/README.md](deploy/README.md).

Biến môi trường của từng app có giải thích trong file `.env.example` tương ứng.
