# Triển khai lên VPS (phương án A)

Chuẩn bị sẵn để dùng sau khi web hoàn thành. Kiến trúc: một VPS chạy Docker gồm Postgres, API, admin và Caddy (HTTPS tự động).
Web bán hàng (`apps/web`) đặt ở đâu sẽ quyết định sau; khi đó chỉ cần đổi `WEB_APP_URL` trong `deploy/.env`.

## Khi đến lúc deploy

1. Mua tên miền, thuê VPS (Ubuntu 24.04, 2 vCPU / 2 GB RAM), cài Docker.
2. Trỏ DNS `api.<domain>` và `admin.<domain>` về IP VPS (Cloudflare: để chế độ "DNS only" lúc lấy chứng chỉ lần đầu).
3. Trên VPS: kéo code về, `cp deploy/.env.example deploy/.env` rồi điền giá trị thật (mật khẩu DB, `JWT_SECRET`, ...).
4. Khởi chạy:
   ```
   docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
   ```
   API tự áp migration khi khởi động.
5. Tạo tài khoản admin (không nạp dữ liệu mẫu):
   ```
   docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env run --rm \
     -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... api npm run prisma:create-admin -w apps/api
   ```
6. Tường lửa chỉ mở cổng 22, 80, 443 (`ufw allow 22,80,443/tcp && ufw enable`).
7. Sao lưu: thêm cron chạy `deploy/backup.sh` mỗi đêm; thử khôi phục ít nhất một lần.

## Lưu ý

- Không chạy `db:seed` trên máy thật: seed có đơn hàng mẫu `DEMO-...` chỉ dành cho môi trường phát triển.
- Cập nhật phiên bản mới: `git pull` rồi chạy lại lệnh `up -d --build`.
- Dữ liệu nằm ở volume `postgres_data`; đừng chạy `docker compose down -v` trên máy thật.
