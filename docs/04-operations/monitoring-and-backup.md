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

## 2. Giám sát

| Việc | Công cụ | Trạng thái |
|---|---|:-:|
| Bắt lỗi runtime (trình duyệt khách, server web / admin, API) | **Sentry** — đã gắn sẵn, bật bằng biến môi trường (mục 2.1) | ✅ code · cần đặt DSN |
| Báo khi web / API sập | UptimeRobot hoặc Better Stack: kiểm tra `https://<DOMAIN>` và `https://<API>/health` mỗi 5 phút, báo qua email / Telegram (bản demo Render đã dùng UptimeRobot để giữ API thức) | 🟡 |
| Đĩa, RAM, CPU VPS (khi chuyển lên VPS) | Biểu đồ của nhà cung cấp VPS, hoặc Netdata | — |
| Hết hạn tên miền | Bật tự gia hạn + nhắc lịch | — |

### 2.1. Bật Sentry (theo dõi lỗi, gói miễn phí 5.000 lỗi / tháng)

1. Tạo tài khoản sentry.io → **Create Project** hai lần:
   - `traicay28-api` — nền tảng **Node.js → NestJS**.
   - `traicay28-web` — nền tảng **Next.js** (web và admin dùng chung một project cho gọn; muốn tách thì tạo thêm `traicay28-admin`).
2. Mỗi project có một **DSN** (dạng `https://xxx@oyyy.ingest.sentry.io/zzz`) — không phải bí mật, nhưng không có thì Sentry tắt.
3. Đặt biến môi trường:

   | Nơi | Biến |
   |---|---|
   | Render (API) | `SENTRY_DSN` = DSN của `traicay28-api`, `SENTRY_ENVIRONMENT=demo` |
   | Vercel (web, admin) | `NEXT_PUBLIC_SENTRY_DSN` = DSN của `traicay28-web` (loại **Config**, không phải Secret — biến `NEXT_PUBLIC_*` được nhúng vào trình duyệt) |
   | Vercel (tuỳ chọn) | `SENTRY_AUTH_TOKEN` (Secret), `SENTRY_ORG`, `SENTRY_PROJECT` → tải source map để Sentry chỉ đúng dòng code lỗi |

4. Deploy lại. Thử: trên Sentry → **Issues** — lỗi mới sẽ hiện kèm trang, trình duyệt, dòng code. Bật **Alerts → email** khi có lỗi mới.

Đã cấu hình sẵn để **không gửi dữ liệu cá nhân**: không cookie / token đăng nhập, không body request (mật khẩu, mã OTP, thông tin khách), không IP; chỉ gửi lỗi 5xx của API (lỗi 4xx như sai dữ liệu, chưa đăng nhập là bình thường, không gửi); bỏ qua lỗi do tiện ích trình duyệt / mạng chập chờn của khách. File cấu hình: `apps/api/src/instrument.ts`, `apps/{web,admin}/src/instrumentation*.ts`.

### 2.2. Ảnh tải lên được nén tự động

- **Trên trình duyệt** (trước khi gửi): ảnh lớn được xoay đúng chiều, thu nhỏ cạnh dài ≤ 2000px, đổi sang WebP (≈ 0,86) — ảnh điện thoại 5–12MB còn vài trăm KB, gửi nhanh và lọt giới hạn ~4,5MB / request của Vercel. Chọn được ảnh tới 30MB.
- **Trên API** (`sharp`): nén lại lần nữa (≤ 2000px, WebP chất lượng 82), **bỏ metadata** (vị trí GPS, máy chụp), từ chối file hỏng; nếu WebP không nhẹ hơn thì giữ file gốc. GIF giữ nguyên (ảnh động).
- Ví dụ đo được: logo PNG 4096×4096 **4,9MB → 165KB** WebP 2000×2000.

### 2.3. Xuất Excel đơn hàng

Trang **Đơn hàng** → khung **Xuất Excel**: lấy đúng bộ lọc đang xem (tab trạng thái, ô tìm) + khoảng ngày (giờ Việt Nam, để trống = mọi ngày), tối đa 20.000 đơn.

- Sheet **Đơn hàng**: mã đơn, ngày giờ, khách, SĐT (giữ số 0 đầu), địa chỉ, trạng thái, thanh toán, số món, tạm tính, phí ship, giảm giá, tổng tiền, ghi chú; dòng **TỔNG CỘNG** dùng công thức `SUMIFS` bỏ đơn đã huỷ.
- Sheet **Chi tiết sản phẩm**: mỗi món một dòng (sản phẩm, quy cách, số lượng, đơn giá, thành tiền) — lọc / Pivot theo sản phẩm.
- Tiền định dạng `1.234.000 đ`, hàng tiêu đề cố định, có sẵn bộ lọc. Cần quyền **Đơn hàng**. API: `GET /admin/orders/export` (`apps/api/src/orders/orders-export.ts`).

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
