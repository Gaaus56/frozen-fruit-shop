# Frozen Fruit Shop — API

Backend NestJS + Prisma + PostgreSQL cho website bán trái cây đông lạnh. Đây là một workspace trong monorepo gốc — xem `docs/guide/` ở thư mục gốc repo để hiểu toàn bộ cấu trúc.

## Chạy cục bộ

Chạy các lệnh sau từ **thư mục gốc repo** (không phải từ `apps/api`), vì đây là npm workspace:

```bash
npm install                 # cài dependency cho toàn bộ monorepo
npm run db:up                # khởi động PostgreSQL qua Docker (cổng 5434)
cp apps/api/.env.example apps/api/.env
npm run db:migrate           # tạo schema từ prisma/schema.prisma
npm run db:seed              # nạp dữ liệu mẫu từ packages/fixtures
npm run dev:api               # chạy API ở chế độ watch, http://localhost:4000
```

## Cấu trúc

```
apps/api/
├── prisma/
│   ├── schema.prisma   # định nghĩa model (Product, Category, Order...)
│   ├── migrations/     # lịch sử migration do Prisma sinh ra
│   └── seed.ts         # nạp dữ liệu mẫu từ @frozen-fruit-shop/fixtures
└── src/
    ├── prisma/          # PrismaService/PrismaModule dùng chung
    ├── products/        # module sản phẩm (controller + service)
    ├── categories/      # module danh mục
    ├── blog-posts/      # module bài viết
    ├── app.module.ts
    └── main.ts
```

## Endpoint hiện có

- `GET /products` — danh sách sản phẩm, có thể lọc `?category=<slug>`
- `GET /products/:slug` — chi tiết một sản phẩm
- `GET /categories`, `GET /categories/:slug`
- `GET /blog-posts`, `GET /blog-posts/:slug`

## Script hữu ích

| Lệnh (chạy từ gốc repo) | Mục đích |
|---|---|
| `npm run dev:api` | Chạy API ở chế độ watch |
| `npm run build:api` | Build production (`dist/`) |
| `npm run db:migrate` | Áp dụng migration mới sau khi sửa `schema.prisma` |
| `npm run db:seed` | Nạp lại dữ liệu mẫu |
| `npm run db:studio` | Mở Prisma Studio để xem/sửa dữ liệu trực quan |
