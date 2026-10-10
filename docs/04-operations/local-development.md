# Chạy trên máy dev

## 1. Yêu cầu

- Node.js 22+ và npm 10+
- Docker (chạy PostgreSQL)
- Git

## 2. Lần đầu

Chạy từ thư mục gốc repo:

```bash
npm install                                   # cài toàn bộ workspace, tự build packages/types
npm run db:up                                 # PostgreSQL qua Docker, cổng 5434

cp apps/api/.env.example apps/api/.env        # điền ADMIN_EMAIL, ADMIN_PASSWORD (≥ 12 ký tự)
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local

npm run db:deploy                             # tạo bảng từ migration
npm run admin:create                          # tạo tài khoản ADMIN duy nhất

npm run dev:api                               # http://localhost:4000
npm run dev:web                               # http://localhost:3000
npm run dev:admin                             # http://localhost:3002
```

Sau đó đăng nhập admin, lần lượt nhập: **Thông tin cửa hàng → Danh mục → Sản phẩm → Banner → Chính sách → Bài viết**. Database không có dữ liệu mẫu.

**Muốn có sẵn dữ liệu để thử** (thay cho bước nhập tay và `admin:create`):

```bash
npm run db:seed:test      # XOÁ SẠCH database rồi nạp dữ liệu kiểm thử; đăng nhập admin@test.vn / Admin@123456
```

Chi tiết bộ dữ liệu: [06-testing/README.md §3](../06-testing/README.md#3-dữ-liệu-chuẩn-bị).

Kiểm tra nhanh: `http://localhost:4000/health` trả OK; trang chủ web hiện thông tin cửa hàng.

## 3. Lệnh thường dùng

| Lệnh | Tác dụng |
|---|---|
| `npm run dev:web` / `dev:admin` / `dev:api` | Chạy từng app ở chế độ phát triển |
| `npm run build:web` / `build:admin` / `build:api` | Build production |
| `npm run lint:web` / `lint:admin` | Kiểm tra ESLint |
| `npm run build:packages` | Build lại `packages/types` sau khi sửa |
| `npm run db:up` / `db:down` | Bật / tắt PostgreSQL Docker (dữ liệu giữ trong volume) |
| `npm run db:migrate` | Sau khi sửa `schema.prisma`: tạo migration mới và áp dụng (chỉ máy dev) |
| `npm run db:deploy` | Áp migration có sẵn (máy chủ, database mới) |
| `npm run db:studio` | Prisma Studio — xem/sửa dữ liệu trực quan |
| `npm run admin:create` | Tạo ADMIN, hoặc **đặt lại mật khẩu ADMIN** (quên mật khẩu) theo `ADMIN_EMAIL`/`ADMIN_PASSWORD` trong `apps/api/.env` |
| `npm run db:seed:test` | **Xoá sạch** database rồi nạp dữ liệu kiểm thử (chỉ máy dev / staging) |

## 4. Biến môi trường

### `apps/api/.env`

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `DATABASE_URL` | — (bắt buộc) | Chuỗi kết nối PostgreSQL |
| `PORT` | 4000 | Cổng API |
| `PUBLIC_URL` | `http://localhost:4000` | URL công khai của API, dùng tạo link ảnh |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3002` | Origin được gọi API từ trình duyệt |
| `JWT_SECRET` | chuỗi dev | **Bắt buộc ≥ 32 ký tự khi production** (API từ chối khởi động nếu thiếu) |
| `JWT_EXPIRES_IN` | `12h` | Thời hạn phiên đăng nhập admin |
| `UPLOAD_DIR` | `uploads` | Thư mục lưu ảnh |
| `WEB_REVALIDATE_URL` | trống | `http://<web>/api/revalidate` — để trống thì web tự làm mới sau ≤ 5 phút |
| `REVALIDATE_SECRET` | trống | Khoá chung với web |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | — | Chỉ dùng cho `npm run admin:create` |

### `apps/web/.env.local`
`NEXT_PUBLIC_API_URL`, `API_URL` (tuỳ chọn), `REVALIDATE_SECRET` — xem [web.md](../03-apps/web.md#6-biến-môi-trường-appswebenvlocal).

### `apps/admin/.env.local`
`API_URL` — địa chỉ API cho server admin.

Biến môi trường production: [deployment.md](deployment.md#3-biến-môi-trường-production).

## 5. Sự cố thường gặp

| Hiện tượng | Nguyên nhân / cách xử lý |
|---|---|
| API báo không kết nối được database | Chưa `npm run db:up`, hoặc `DATABASE_URL` sai cổng (dev dùng **5434**) |
| Web không thấy dữ liệu mới sau khi sửa ở admin | `WEB_REVALIDATE_URL` / `REVALIDATE_SECRET` chưa khớp giữa API và web → đợi ≤ 5 phút hoặc sửa `.env` |
| Lỗi type `@frozen-fruit-shop/types` sau khi sửa package | Chạy `npm run build:packages` |
| Ảnh không hiện trên web | `NEXT_PUBLIC_API_URL` sai → `next/image` chặn tên miền ảnh |
| Quên mật khẩu ADMIN | Đổi `ADMIN_PASSWORD` trong `apps/api/.env` rồi `npm run admin:create` |
