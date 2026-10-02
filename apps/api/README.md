# Trái Cây Đông Lạnh Đà Nẵng 28 — API

Backend NestJS 12 (ESM) + Prisma 6 + PostgreSQL. Workspace con của monorepo gốc — xem [docs/](../../docs/README.md) ở gốc repo, đặc biệt [api.md](../../docs/03-apps/api.md) (danh sách endpoint) và [database.md](../../docs/03-apps/database.md) (mô hình dữ liệu).

## Chạy cục bộ

Chạy từ **thư mục gốc repo** (npm workspace):

```bash
npm install
npm run db:up                # PostgreSQL qua Docker, cổng 5434
cp apps/api/.env.example apps/api/.env
npm run db:deploy            # áp migration, tạo bảng
npm run admin:create         # tạo tài khoản ADMIN duy nhất (dùng ADMIN_EMAIL/ADMIN_PASSWORD trong .env)
npm run dev:api              # http://localhost:4000, chế độ watch
```

Không có `db:seed` / dữ liệu mẫu — database khởi tạo rỗng ngoài tài khoản ADMIN.

## Cấu trúc

```
apps/api/
├── prisma/
│   ├── schema.prisma      # mô hình dữ liệu (User, Category, Product, Order...)
│   ├── migrations/        # lịch sử migration
│   └── create-admin.ts    # tạo / đặt lại mật khẩu tài khoản ADMIN duy nhất
└── src/
    ├── auth/, users/       # đăng nhập, phiên, tài khoản nhân viên
    ├── categories/, products/
    ├── orders/, inquiries/
    ├── content/            # posts, banners, policies, settings
    ├── uploads/, stats/, revalidate/
    ├── common/, config/, prisma/
    └── main.ts
```

## Script hữu ích (chạy từ gốc repo)

| Lệnh | Mục đích |
|---|---|
| `npm run dev:api` | Chạy API ở chế độ watch |
| `npm run build:api` | Build production (`dist/`) |
| `npm run db:migrate` | Tạo migration mới sau khi sửa `schema.prisma` (máy dev) |
| `npm run db:deploy` | Áp migration có sẵn, không xoá dữ liệu (máy chủ) |
| `npm run db:studio` | Mở Prisma Studio |
| `npm run admin:create` | Tạo ADMIN, hoặc đặt lại mật khẩu nếu đã tồn tại |
