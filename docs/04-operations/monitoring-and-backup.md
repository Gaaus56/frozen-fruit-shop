# Giám sát, sao lưu và khôi phục

## 1. Log

| Nguồn | Xem bằng | Nội dung |
|---|---|---|
| API | `docker compose -f deploy/docker-compose.prod.yml logs -f api` | Khởi động, lỗi Prisma, lỗi báo web xoá cache |
| Web / admin | `... logs -f web` / `... logs -f admin` | Lỗi render, lỗi gọi API (web dùng dữ liệu dự phòng và ghi log) |
| Caddy | `... logs -f caddy` | Cấp / gia hạn HTTPS, lỗi proxy |

Hiện log chỉ nằm trong Docker (stdout). Nên giới hạn dung lượng để không đầy đĩa — thêm vào `/etc/docker/daemon.json`:

```json
{ "log-driver": "json-file", "log-opts": { "max-size": "20m", "max-file": "5" } }
```

## 2. Giám sát (chưa có — kế hoạch)

| Việc | Công cụ đề xuất (miễn phí) | Ưu tiên |
|---|---|:-:|
| Báo khi web / API sập | UptimeRobot hoặc Better Stack: kiểm tra `https://<DOMAIN>` và `https://api.<DOMAIN>/health` mỗi 5 phút, báo qua email / Telegram | P1 |
| Bắt lỗi runtime (trình duyệt + server) | Sentry (`@sentry/nextjs`, `@sentry/nestjs`) | P2 |
| Đĩa, RAM, CPU VPS | Biểu đồ của nhà cung cấp VPS, hoặc Netdata | P2 |
| Hết hạn tên miền | Bật tự gia hạn + nhắc lịch | P1 |

## 3. Sao lưu

Phải sao lưu **cả hai**: database và thư mục ảnh.

| Dữ liệu | Cách | Tần suất | Giữ |
|---|---|---|---|
| Database | `deploy/backup.sh` (pg_dump + gzip) vào `/var/backups/ffs` | Mỗi đêm (cron) | 14 bản |
| Ảnh | `tar` volume `uploads_data` (lệnh bên dưới) | Mỗi đêm / tuần | 4 bản |
| `deploy/.env` | Lưu trong trình quản lý mật khẩu | Khi đổi | — |
| Mã nguồn | GitHub | Mỗi commit | — |

```bash
# Cron (crontab -e trên VPS)
0 2 * * * cd /opt/frozen-fruit-shop && ./deploy/backup.sh >> /var/log/ffs-backup.log 2>&1
30 2 * * * docker run --rm -v frozen-fruit-shop_uploads_data:/data -v /var/backups/ffs:/backup alpine \
           tar czf /backup/uploads-$(date +\%F).tar.gz -C /data .
```

> Tên volume thật xem bằng `docker volume ls` (tiền tố là tên project Compose).

**Còn thiếu (P1):** bản sao lưu đang nằm trên chính VPS — mất VPS là mất hết. Cần đẩy ra ngoài, ví dụ `rclone copy /var/backups/ffs r2:ffs-backup` (Cloudflare R2 / Backblaze B2 / Google Drive) sau mỗi lần sao lưu.

## 4. Khôi phục

Diễn tập khôi phục **3 tháng một lần** trên máy dev — sao lưu chưa từng khôi phục thử thì coi như chưa có.

```bash
# Database
gunzip -c ffs-YYYYMMDD-HHMMSS.sql.gz | docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env \
  exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

# Ảnh
docker run --rm -v frozen-fruit-shop_uploads_data:/data -v /var/backups/ffs:/backup alpine \
  sh -c "cd /data && tar xzf /backup/uploads-YYYY-MM-DD.tar.gz"
```

## 5. Xử lý sự cố

| Sự cố | Làm gì |
|---|---|
| Web hiện trang nhưng thiếu sản phẩm | API lỗi → web dùng dữ liệu dự phòng. Xem `logs api`, kiểm tra `postgres` còn chạy |
| Admin không đăng nhập được, báo quá nhiều lần | Rate limit 10 lần / phút chung cho cả shop → đợi 1 phút; tài khoản bị khoá 15 phút sau 5 lần sai |
| Quên mật khẩu ADMIN | Chạy lại lệnh tạo ADMIN với `ADMIN_PASSWORD` mới ([deployment.md §4](deployment.md#4-chạy-lần-đầu)) |
| HTTPS lỗi | DNS chưa trỏ đúng, hoặc cổng 80 bị chặn → xem `logs caddy` |
| VPS mất hẳn | VPS mới → [deployment.md](deployment.md) → khôi phục database + ảnh từ bản sao lưu ngoài → trỏ lại DNS |
| Đĩa đầy | `docker system prune` (không có `-v`!), giới hạn log, xoá bản sao lưu cũ |

Mục tiêu khôi phục: mất tối đa **24 giờ** dữ liệu (RPO), hệ thống chạy lại trong **4 giờ** (RTO).
