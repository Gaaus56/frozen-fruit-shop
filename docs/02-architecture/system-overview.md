# Kiến trúc hệ thống

## 1. Thành phần

```
                 Trình duyệt khách                     Trình duyệt chủ shop / nhân viên
                        │                                           │
                        ▼                                           ▼
              ┌──────────────────────── Caddy (HTTPS, gzip, reverse proxy) ─────────────────────┐
              │  <DOMAIN>                     api.<DOMAIN>                   admin.<DOMAIN>     │
              └──────┬────────────────────────────┬───────────────────────────────┬────────────┘
                     │ trang HTML                 │ đặt hàng, báo giá,            │ HTML + Server Actions
                     ▼                            │ tra cứu, liên hệ, SSE         ▼
             ┌────────────────┐                   │                     ┌──────────────────┐
             │ apps/web :3000 │                   │                     │ apps/admin :3002 │
             │ Next.js (SSR + │                   │                     │ Next.js, cookie  │
             │ cache 5 phút)  │                   │                     │ httpOnly (JWT)   │
             └───────┬────────┘                   │                     └────────┬─────────┘
                     │ GET dữ liệu công khai      │                              │ /admin/* + Bearer JWT
                     ▼                            ▼                              ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ apps/api :4000 — NestJS 12 + Prisma 6                                                    │
 │  • route công khai  /products /categories /posts /banners /policies /settings            │
 │                     /orders (quote, tạo, tra cứu) /inquiries /events (SSE)               │
 │  • route quản trị   /admin/*  (JWT, kiểm tra quyền ADMIN / STAFF)                        │
 │  • /uploads/*       ảnh do admin tải lên (lưu trên đĩa)                                  │
 └───────┬──────────────────────────────────────────────────────┬───────────────────────────┘
         │ Prisma                                                │ POST /api/revalidate (khoá bí mật)
         ▼                                                       ▼
 ┌────────────────┐                                      báo web xoá cache ngay
 │ PostgreSQL 16  │                                      khi admin sửa dữ liệu
 └────────────────┘
```

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| `apps/web` | Next.js 16 (App Router), React 19, Tailwind CSS 4 | Website bán hàng cho khách |
| `apps/admin` | Next.js 16, React 19, Tailwind CSS 4 | Trang quản trị cho chủ shop và nhân viên |
| `apps/api` | NestJS 12 (ESM), Prisma 6, class-validator, JWT (`@nestjs/jwt`), bcryptjs | REST API duy nhất, nắm toàn bộ nghiệp vụ và phân quyền |
| Database | PostgreSQL 16 (Docker) | Lưu dữ liệu |
| `packages/types` | TypeScript | Hợp đồng dữ liệu dùng chung (type, nhãn tiếng Việt, thông tin cửa hàng mặc định) |
| Caddy | Caddy 2 | Cổng vào duy nhất: HTTPS tự động, nén, chuyển tiếp tới 3 app |

Monorepo dùng **npm workspaces**: một lệnh `npm install` ở gốc cho cả ba app. Lý do chọn từng công nghệ: [decisions.md](../05-roadmap/decisions.md).

## 2. Các lớp của hệ thống

| Lớp | Thực hiện bởi | Chi tiết |
|---|---|---|
| Domain & DNS | Nhà cung cấp tên miền (bản ghi A) | [deployment.md](../04-operations/deployment.md) |
| Hosting & compute | 1 VPS, Docker Compose (5 container) | [deployment.md](../04-operations/deployment.md) |
| HTTPS, nén | Caddy | [deployment.md](../04-operations/deployment.md) |
| Giao diện | `apps/web`, `apps/admin` | [web.md](../03-apps/web.md), [admin.md](../03-apps/admin.md) |
| API & nghiệp vụ | `apps/api` | [api.md](../03-apps/api.md) |
| Dữ liệu | PostgreSQL + thư mục ảnh | [database.md](../03-apps/database.md) |
| Xác thực & phân quyền | JWT + kiểm tra DB mỗi request | [security.md](security.md) |
| Cache | Cache dữ liệu Next.js (5 phút + xoá theo tag), ảnh cache 365 ngày | [request-flows.md](request-flows.md#1-khách-xem-sản-phẩm) |
| Realtime | SSE trong `apps/api` | [request-flows.md](request-flows.md#5-cập-nhật-realtime) |
| Rate limit | Guard trong `apps/api` | [api.md §3](../03-apps/api.md#3-giới-hạn-tần-suất-theo-ip) |
| Log, sao lưu | stdout của container, `deploy/backup.sh` | [monitoring-and-backup.md](../04-operations/monitoring-and-backup.md) |

## 3. Nguyên tắc thiết kế

- **API là nguồn sự thật duy nhất.** Web và admin không truy cập database trực tiếp; mọi kiểm tra dữ liệu và phân quyền nằm ở API.
- **Không tin dữ liệu từ trình duyệt.** Giá, tạm tính, trạng thái còn hàng luôn được API tính lại từ database khi báo giá và khi tạo đơn; giá phía client chỉ để hiển thị.
- **Hợp đồng chung.** Kiểu dữ liệu trả về của API được khai báo một lần trong `packages/types` và dùng ở cả ba app — sửa một chỗ, TypeScript báo lỗi ở mọi nơi dùng sai.
- **Không có dữ liệu mẫu.** Database khởi tạo rỗng (chỉ có tài khoản ADMIN tạo bằng lệnh). Toàn bộ nội dung web do admin nhập.
- **Web vẫn chạy khi API lỗi.** Lớp dữ liệu của web có dữ liệu dự phòng (thông tin cửa hàng mặc định, danh sách rỗng) nên trang không sập; build web không cần API.
- **Đơn giản trước, mở rộng khi cần.** Một máy chủ, một tiến trình API; rate limit và realtime nằm trong bộ nhớ. Khi cần nhiều instance → thêm Redis (xem [roadmap.md](../05-roadmap/roadmap.md)).

## 4. Giới hạn hiện tại

| Giới hạn | Ảnh hưởng | Khi nào cần xử lý |
|---|---|---|
| API chạy 1 instance (rate limit + SSE trong bộ nhớ) | Không scale ngang được | Khi 1 VPS không chịu nổi tải — khó xảy ra ở quy mô cửa hàng |
| Ảnh lưu trên đĩa VPS | Mất VPS = mất ảnh nếu không sao lưu | Sao lưu ra ngoài ngay; chuyển sang object storage (R2/S3) khi cần CDN |
| Không có CDN | Ảnh / trang tải từ một máy chủ ở một vị trí | Khi khách ngoài Đà Nẵng nhiều hoặc băng thông VPS hạn chế |
