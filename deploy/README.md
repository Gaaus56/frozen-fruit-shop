# Triển khai production

Docker Compose gồm Postgres, API, web, admin và Caddy (HTTPS tự động qua Let's Encrypt). Ba tên miền: `<DOMAIN>` (web khách), `api.<DOMAIN>`, `admin.<DOMAIN>`.

Hướng dẫn đầy đủ (chuẩn bị VPS, DNS, biến môi trường, tạo tài khoản admin, sao lưu):
**[docs/04-operations/deployment.md](../docs/04-operations/deployment.md)**

Tóm tắt lệnh khởi chạy trên VPS:

```bash
cp deploy/.env.example deploy/.env   # điền DOMAIN, mật khẩu DB, JWT_SECRET, REVALIDATE_SECRET
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
```

Không chạy `docker compose down -v` trên máy thật — sẽ xoá volume database và ảnh (`postgres_data`, `uploads_data`).
