# Triển khai production

Docker Compose gồm Postgres, API, web, admin và Caddy (HTTPS tự động qua Let's Encrypt). Ba tên miền: `<DOMAIN>` (web khách), `api.<DOMAIN>`, `admin.<DOMAIN>`.

Khởi chạy trên VPS (Ubuntu, đã cài Docker; DNS của 3 tên miền trỏ về IP VPS):

```bash
cp deploy/.env.example deploy/.env   # điền DOMAIN, mật khẩu DB, JWT_SECRET, REVALIDATE_SECRET (OTP_ENCRYPTION_KEY nên đặt)
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env exec api npm run prisma:create-admin -w apps/api
```

Sao lưu database hằng ngày: `backup.sh` (hướng dẫn cron ở đầu file).

`api.Dockerfile` cũng là Dockerfile mà bản demo trên Render dùng — đổi file này là đổi luôn bản demo.

Không chạy `docker compose down -v` trên máy thật — sẽ xoá volume database và ảnh (`postgres_data`, `uploads_data`).
