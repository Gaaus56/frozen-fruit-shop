# Triển khai production

Mục tiêu: một VPS chạy toàn bộ hệ thống bằng Docker Compose, Caddy lo HTTPS. File cấu hình ở `deploy/`.

## 1. Sơ đồ triển khai

```
                Internet
                   │  80 / 443 (tường lửa chỉ mở 22, 80, 443)
┌──────────────────┼──────────────────────────────── VPS Ubuntu 24.04 ─┐
│                  ▼                                                    │
│   caddy ── <DOMAIN>        ──► web:3000                               │
│         ── www.<DOMAIN>    ──► chuyển hướng 301 về <DOMAIN>           │
│         ── api.<DOMAIN>    ──► api:4000 ──► postgres:5432             │
│         ── admin.<DOMAIN>  ──► admin:3002                             │
│                                                                       │
│   Volume: postgres_data (database) · uploads_data (ảnh)               │
│           caddy_data (chứng chỉ HTTPS)                                │
└───────────────────────────────────────────────────────────────────────┘
```

Chỉ Caddy mở cổng ra ngoài; postgres, api, web, admin nói chuyện qua mạng nội bộ Docker. Web và admin gọi API bằng `http://api:4000` (không qua Internet).

## 2. Chuẩn bị (làm một lần)

| Bước | Việc | Ghi chú |
|---|---|---|
| 1 | Mua tên miền (ví dụ `traicaydonglanh28.com`) | |
| 2 | Thuê VPS Ubuntu 24.04, tối thiểu **2 vCPU / 2 GB RAM** / 40 GB SSD, đặt ở Việt Nam hoặc Singapore | Build Next.js cần RAM; thêm 2 GB swap nếu chỉ có 2 GB |
| 3 | Tạo bản ghi DNS **A**: `@`, `www`, `api`, `admin` → IP VPS | Chờ DNS cập nhật trước khi chạy Caddy, nếu không cấp HTTPS sẽ lỗi |
| 4 | Bảo mật VPS: tạo user thường, SSH bằng khoá, tắt đăng nhập root + mật khẩu, `ufw allow 22,80,443`, cài `fail2ban` | |
| 5 | Cài Docker Engine + Docker Compose plugin | |
| 6 | `git clone` repo vào `/opt/frozen-fruit-shop` | |

## 3. Biến môi trường production

`cp deploy/.env.example deploy/.env` rồi điền:

| Biến | Cách tạo |
|---|---|
| `DOMAIN` | Tên miền gốc, không có `https://` |
| `POSTGRES_USER`, `POSTGRES_DB` | Tuỳ chọn |
| `POSTGRES_PASSWORD` | `openssl rand -base64 32` |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `REVALIDATE_SECRET` | `openssl rand -hex 24` |

Các biến còn lại (`PUBLIC_URL`, `CORS_ORIGINS`, `WEB_REVALIDATE_URL`, `UPLOAD_DIR`…) được `docker-compose.prod.yml` tự ghép từ `DOMAIN`. **Không commit** `deploy/.env`.

## 4. Chạy lần đầu

```bash
cd /opt/frozen-fruit-shop
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
# API tự chạy "prisma migrate deploy" khi khởi động

# Tạo ADMIN
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env run --rm \
  -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... api npm run prisma:create-admin -w apps/api
```

Kiểm tra sau khi chạy:
- [ ] `https://api.<DOMAIN>/health` trả OK, ổ khoá HTTPS hợp lệ.
- [ ] `https://<DOMAIN>` hiện trang chủ; `https://www.<DOMAIN>` chuyển về `<DOMAIN>`.
- [ ] Đăng nhập `https://admin.<DOMAIN>`, tải thử 1 ảnh, tạo 1 sản phẩm → web hiện ngay.
- [ ] Đặt thử 1 đơn từ điện thoại → admin nhận thông báo realtime.
- [ ] Cài cron sao lưu ([monitoring-and-backup.md](monitoring-and-backup.md)).

## 5. Cập nhật phiên bản

```bash
cd /opt/frozen-fruit-shop
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
```

- Chạy sao lưu database **trước** khi cập nhật nếu có migration mới.
- Migration chỉ thêm, không xoá dữ liệu (`migrate deploy`). Đổi tên / xoá cột phải làm theo 2 bước qua 2 lần phát hành.
- Quay lại bản cũ: `git checkout <tag-cũ>` rồi chạy lại lệnh trên (chỉ an toàn khi bản mới không có migration phá vỡ).

## 6. Lưu ý

- `NEXT_PUBLIC_API_URL` của web được đóng gói lúc build (`https://api.<DOMAIN>`) — **đổi tên miền phải build lại web**.
- Ảnh nằm ở volume `uploads_data`, database ở `postgres_data`. **Không bao giờ chạy `docker compose down -v`** trên máy thật — sẽ xoá dữ liệu.
- Realtime (SSE) qua Caddy: `Caddyfile` đã tắt nén cho `/events`, `/admin/events` (api) và `/api/events` (admin) và đặt `flush_interval -1`. Nếu đổi sang Nginx: `proxy_buffering off;` và `proxy_read_timeout` > 30 giây cho các đường dẫn này.
- Muốn thêm CDN / chống DDoS: đặt Cloudflare trước Caddy (chế độ proxy, SSL "Full (strict)"); nhớ cấu hình để API đọc đúng IP khách (`CF-Connecting-IP`) cho rate limit.
