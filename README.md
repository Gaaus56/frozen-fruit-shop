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
docs/guide/   # Tài liệu kỹ thuật — bắt đầu từ đây
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

Toàn bộ tài liệu kỹ thuật (kiến trúc, tính năng từng app, API, database, phân quyền, cài đặt, triển khai) nằm ở **[docs/guide/](docs/guide/README.md)**.

Thông tin doanh nghiệp gốc: `docs/info/WEB_info.md`. Tài liệu kế hoạch ban đầu (tham khảo lịch sử): `docs/plan/`.
