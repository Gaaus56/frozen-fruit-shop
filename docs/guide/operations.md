# Cài đặt, vận hành và triển khai

## 1. Yêu cầu

- Node.js 22+ và npm 10+
- Docker (chạy PostgreSQL)

## 2. Chạy trên máy dev (lần đầu)

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

## 3. Lệnh thường dùng

| Lệnh | Tác dụng |
|---|---|
| `npm run dev:web` / `dev:admin` / `dev:api` | Chạy từng app ở chế độ phát triển |
| `npm run build:web` / `build:admin` / `build:api` | Build production |
| `npm run lint:web` / `lint:admin` | Kiểm tra ESLint |
| `npm run db:up` / `db:down` | Bật / tắt PostgreSQL Docker (dữ liệu giữ trong volume) |
| `npm run db:migrate` | Sau khi sửa `schema.prisma`: tạo migration mới và áp dụng (chỉ máy dev) |
| `npm run db:deploy` | Áp migration có sẵn (máy chủ, database mới) |
| `npm run db:studio` | Prisma Studio — xem/sửa dữ liệu trực quan |
| `npm run admin:create` | Tạo ADMIN, hoặc **đặt lại mật khẩu ADMIN** (quên mật khẩu) theo `ADMIN_EMAIL`/`ADMIN_PASSWORD` trong `apps/api/.env` |

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
`NEXT_PUBLIC_API_URL`, `API_URL` (tuỳ chọn), `REVALIDATE_SECRET` — xem [web.md](web.md#5-biến-môi-trường-appswebenvlocal).

### `apps/admin/.env.local`
`API_URL` — địa chỉ API cho server admin.

## 5. Triển khai lên VPS

Chuẩn bị sẵn trong thư mục `deploy/`: Docker Compose gồm **postgres, api, web, admin, caddy** (Caddy tự cấp HTTPS).

| Tên miền | Dịch vụ |
|---|---|
| `<DOMAIN>` (và `www.` chuyển hướng về) | Web khách hàng |
| `api.<DOMAIN>` | API + ảnh `/uploads` |
| `admin.<DOMAIN>` | Trang quản trị |

Các bước:
1. VPS Ubuntu 24.04 (2 vCPU / 2 GB RAM), cài Docker. Trỏ DNS ba tên miền trên về IP VPS.
2. `cp deploy/.env.example deploy/.env`, điền `DOMAIN`, mật khẩu Postgres, `JWT_SECRET` (`openssl rand -base64 48`), `REVALIDATE_SECRET` (`openssl rand -hex 24`).
3. `docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build` — API tự áp migration khi khởi động.
4. Tạo ADMIN:
   ```bash
   docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env run --rm \
     -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... api npm run prisma:create-admin -w apps/api
   ```
5. Tường lửa chỉ mở 22, 80, 443.
6. Cập nhật phiên bản: `git pull` rồi chạy lại lệnh ở bước 3.

Ghi chú:
- `NEXT_PUBLIC_API_URL` của web được đóng gói lúc build (`https://api.<DOMAIN>`) — đổi tên miền phải build lại web.
- Ảnh nằm ở volume `uploads_data`, database ở `postgres_data`. **Không chạy `docker compose down -v`** trên máy thật.
- Realtime (SSE) chạy qua Caddy: `Caddyfile` đã tắt nén gzip cho `/events`, `/admin/events` (api) và `/api/events` (admin). Nếu đổi sang Nginx: `proxy_buffering off;` và `proxy_read_timeout` > 30 giây cho các đường dẫn này.

## 6. Sao lưu

- Database: `deploy/backup.sh` (pg_dump, giữ 14 bản), chạy bằng cron mỗi đêm.
- Ảnh: sao lưu volume `uploads_data`, ví dụ
  `docker run --rm -v <project>_uploads_data:/data -v /var/backups/ffs:/backup alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .`
- Nên đẩy bản sao lưu ra ngoài VPS (Cloudflare R2, Backblaze B2, Google Drive) và thử khôi phục định kỳ.

## 7. CI

`.github/workflows/ci.yml` chạy khi mở PR vào `main`: cài đặt, lint web + admin, build web + admin, `prisma generate`, build API. Build web không cần API hay database.
