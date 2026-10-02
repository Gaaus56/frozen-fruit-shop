# Trái Cây Đông Lạnh Đà Nẵng 28

Website bán trái cây đông lạnh: website khách hàng, trang quản trị và backend API dùng chung — npm workspaces monorepo.

```
apps/
├── web/      # Website khách hàng (Next.js, :3000)
├── admin/    # Trang quản trị (Next.js, :3002)
└── api/      # Backend (NestJS + Prisma + PostgreSQL, :4000)
packages/
└── types/    # Kiểu dữ liệu dùng chung giữa web / admin / api
deploy/       # Triển khai production (Docker Compose + Caddy)
docs/         # Tài liệu — bắt đầu từ docs/README.md
```

## Bắt đầu nhanh

```bash
npm install
npm run db:up

cp apps/api/.env.example apps/api/.env        # điền ADMIN_EMAIL / ADMIN_PASSWORD
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local

npm run db:deploy       # tạo bảng
npm run admin:create    # tạo tài khoản quản trị duy nhất

npm run dev:api     # http://localhost:4000
npm run dev:web     # http://localhost:3000
npm run dev:admin   # http://localhost:3002
```

Database khởi tạo **rỗng** — không có dữ liệu mẫu. Đăng nhập trang quản trị rồi nhập lần lượt: thông tin cửa hàng → danh mục → sản phẩm → banner → chính sách → bài viết.

## Tài liệu

Mục lục đầy đủ: **[docs/README.md](docs/README.md)**.

| Cần biết | Đọc |
|---|---|
| Dự án là gì, có tính năng gì | [overview](docs/01-product/overview.md) · [features](docs/01-product/features.md) |
| Kiến trúc và luồng hoạt động | [system-overview](docs/02-architecture/system-overview.md) · [request-flows](docs/02-architecture/request-flows.md) |
| Từng app | [web](docs/03-apps/web.md) · [admin](docs/03-apps/admin.md) · [api](docs/03-apps/api.md) · [database](docs/03-apps/database.md) |
| Chạy, triển khai, sao lưu | [local-development](docs/04-operations/local-development.md) · [deployment](docs/04-operations/deployment.md) · [monitoring-and-backup](docs/04-operations/monitoring-and-backup.md) |
| Làm gì tiếp theo | [roadmap](docs/05-roadmap/roadmap.md) · [production-readiness](docs/05-roadmap/production-readiness.md) |
