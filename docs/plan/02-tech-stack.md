# 02. Kiến trúc & Công nghệ (Tech Stack)

> Cập nhật: dự án đi theo hướng **tự xây backend** (không dùng nền tảng headless commerce có sẵn như Shopify/Medusa) để chủ động toàn bộ dữ liệu và logic nghiệp vụ (tồn kho theo lô/HSD, khu vực giao hàng, giá sỉ...). Repo được tổ chức theo dạng **monorepo** tách rõ frontend/backend/mã dùng chung.

## 1. Nguyên tắc lựa chọn

- Ưu tiên tốc độ tải trang, SEO tốt (quan trọng vì phụ thuộc tìm kiếm tự nhiên và nội dung blog).
- Tách rõ frontend (trải nghiệm khách hàng) và backend (dữ liệu, nghiệp vụ) thành hai ứng dụng độc lập, triển khai riêng, có thể scale riêng.
- Dùng chung type và dữ liệu mẫu giữa frontend/backend qua các package nội bộ, tránh lệch dữ liệu (single source of truth).
- Kiến trúc dễ mở rộng: thêm module nghiệp vụ mới (đơn hàng, khách hàng, khuyến mãi...) không phải viết lại nền tảng.

## 2. Cấu trúc monorepo

```
frozen-fruit-shop/
├── apps/
│   ├── web/     # Next.js — storefront khách hàng
│   └── api/     # NestJS + Prisma — REST API, nghiệp vụ, kết nối PostgreSQL
├── packages/
│   ├── types/       # Type TypeScript dùng chung (Product, Category, Order, Customer...)
│   └── fixtures/    # Dữ liệu mẫu dùng chung — nội dung catalog cho web, seed data cho database
├── docs/plan/   # Tài liệu kế hoạch
└── docker-compose.yml   # PostgreSQL cho môi trường dev cục bộ
```

Quản lý bằng **npm workspaces** — cài đặt một lần ở thư mục gốc (`npm install`), mỗi app/package là một workspace riêng nhưng vẫn `import` lẫn nhau như package bình thường (`@frozen-fruit-shop/types`, `@frozen-fruit-shop/fixtures`).

## 3. Kiến trúc tổng thể

```
Khách hàng (trình duyệt/mobile)
        │
        ▼
  apps/web — Next.js storefront
        │  gọi REST API
        ▼
  apps/api — NestJS API
        │
        ▼
  PostgreSQL (Prisma ORM)
        │
        ├── Cổng thanh toán (payment gateway)
        ├── Dịch vụ vận chuyển / tính phí ship
        ├── Email/SMS notification
        └── Công cụ phân tích (analytics)
```

## 4. Frontend — `apps/web`

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Framework | Next.js (App Router) | SSR/SSG tốt cho SEO, tối ưu tốc độ trang sản phẩm/blog |
| Ngôn ngữ | TypeScript | Dùng chung type với backend qua `@frozen-fruit-shop/types` |
| Styling | Tailwind CSS v4 | Xây UI nhanh, đồng bộ, responsive dễ dàng |
| State/Cart | React Context (`CartProvider`) + localStorage | Giỏ hàng phía client, đơn giản, không cần thư viện ngoài ở quy mô hiện tại |
| Hình ảnh | next/image | Tối ưu ảnh sản phẩm, lazy loading |
| Nguồn dữ liệu hiện tại | `@frozen-fruit-shop/fixtures` (tĩnh) | Xem mục 8 — sẽ chuyển sang gọi `apps/api` khi cần dữ liệu động |

## 5. Backend — `apps/api`

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Framework | NestJS | Cấu trúc module/controller/service rõ ràng, dễ mở rộng thêm nghiệp vụ (đơn hàng, khách hàng, khuyến mãi...) |
| ORM | Prisma | Type-safe, migration tự sinh, `schema.prisma` là nguồn sự thật cho cấu trúc dữ liệu |
| Database | PostgreSQL | Phù hợp dữ liệu quan hệ (sản phẩm–biến thể–danh mục–đơn hàng), chạy qua Docker ở môi trường dev |
| API style | REST | `GET /products`, `/categories`, `/blog-posts`... — đơn giản, dễ tiêu thụ từ Next.js |
| Seed dữ liệu | `prisma/seed.ts` dùng `@frozen-fruit-shop/fixtures` | Đảm bảo dữ liệu demo trong DB khớp với nội dung hiển thị trên frontend |

### Các module đã có
- `products` — danh sách/chi tiết sản phẩm theo slug, lọc theo danh mục.
- `categories` — danh sách/chi tiết danh mục.
- `blog-posts` — danh sách/chi tiết bài viết.

### Module dự kiến bổ sung (giai đoạn sau, xem `05-roadmap.md`)
- `orders` — tạo đơn hàng, cập nhật trạng thái.
- `customers` — tài khoản khách hàng, địa chỉ đã lưu.
- `delivery-zones` — kiểm tra khu vực giao hàng khi checkout.

## 6. Nội dung (Blog/Trang giới thiệu)

Ở giai đoạn hiện tại, nội dung blog/trang tĩnh được quản lý cùng cơ chế với sản phẩm (model `BlogPost` trong `apps/api`, hoặc fixtures tĩnh cho frontend). Nếu về sau cần cho người không phải dev tự chỉnh nội dung thường xuyên, có thể cân nhắc thêm một headless CMS (Sanity/Contentful) riêng cho phần nội dung, không ảnh hưởng tới phần thương mại (sản phẩm/đơn hàng) đã tự xây.

## 7. Thanh toán & Vận chuyển (kế hoạch tích hợp)

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Thanh toán online | VNPay / MoMo / ZaloPay | Tích hợp qua module `payments` trong `apps/api` (chưa xây) |
| Thanh toán COD | Hỗ trợ mặc định | Phổ biến với khách hàng Việt Nam |
| Tính phí vận chuyển | Giao Hàng Nhanh (GHN) / Giao Hàng Tiết Kiệm (GHTK) API | Gọi từ `apps/api`, cần hỗ trợ đóng gói giữ lạnh |
| Kiểm tra khu vực giao hàng | Model `DeliveryZone` trong `apps/api` (đã có trong schema) | Đặc thù hàng đông lạnh, hạn chế vùng giao ban đầu |

## 8. Trạng thái tích hợp frontend ↔ backend (quan trọng)

`apps/api` hiện là một backend **độc lập, chạy được thật** (đã kiểm thử: migrate + seed + trả dữ liệu qua REST). Tuy nhiên `apps/web` **chưa gọi API này** — để trang web luôn chạy được ngay cả khi chưa có database (ví dụ demo nhanh, CI, hoặc máy dev chưa cài Docker), `apps/web` hiện đọc trực tiếp từ `packages/fixtures`.

Bước tiếp theo hợp lý: thêm một lớp `api-client` trong `apps/web/src/lib`, gọi `apps/api` qua biến môi trường `NEXT_PUBLIC_API_URL` khi có, giữ fixtures làm fallback/dữ liệu demo. Việc này chưa làm ở bước hiện tại để tránh phá vỡ một storefront đang chạy tốt chỉ để đổi sang một nguồn dữ liệu cần thêm hạ tầng (DB) mới chạy được.

## 9. Hosting & Hạ tầng (dự kiến khi triển khai thật)

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Hosting frontend | Vercel | Tối ưu cho Next.js, CDN toàn cầu, preview deploy theo PR |
| Hosting backend | Railway / Render / Fly.io (hoặc VPS tự quản) | Chạy NestJS + kết nối tới PostgreSQL managed |
| Database | PostgreSQL managed (Railway/Supabase/Neon...) | Thay cho Docker Postgres khi lên production |
| DNS/Domain | Cloudflare | Quản lý domain, DNS, thêm lớp bảo mật/cache |

## 10. Dịch vụ bên thứ ba khác

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Email giao dịch | Resend / SendGrid | Email xác nhận đơn hàng, cập nhật trạng thái |
| Chat hỗ trợ | Zalo OA widget, Facebook Messenger, hoặc Tawk.to/Crisp | Giống tham khảo (Zalo Chat) |
| Analytics | Google Analytics 4 + Google Tag Manager | Theo dõi hành vi khách hàng, tỷ lệ chuyển đổi |
| SEO | Google Search Console, sitemap.xml tự sinh từ Next.js | Theo dõi hiệu suất tìm kiếm |

## 11. Công cụ phát triển & CI/CD

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Quản lý mã nguồn | Git + GitHub, npm workspaces | Monorepo, một lockfile duy nhất ở gốc |
| CI/CD | GitHub Actions | Build/lint riêng cho từng app, deploy `apps/web` lên Vercel, `apps/api` lên nền tảng backend đã chọn |
| Kiểm tra chất lượng mã | ESLint (web), TypeScript strict mode (cả hai) | Đồng nhất code style |
| Database migration | Prisma Migrate | `npm run db:migrate` — versioned, chạy trong CI/CD khi deploy |

## 12. Tóm tắt lựa chọn cho giai đoạn hiện tại

- **Frontend:** Next.js + TypeScript + Tailwind CSS (`apps/web`), hiện đọc dữ liệu từ `packages/fixtures`.
- **Backend:** NestJS + Prisma + PostgreSQL (`apps/api`), REST API, đã seed dữ liệu và kiểm thử chạy được.
- **Dùng chung:** `packages/types` (type), `packages/fixtures` (dữ liệu mẫu/seed).
- **Việc còn thiếu để "khép kín":** nối `apps/web` gọi `apps/api` thay vì fixtures tĩnh; thêm module `orders`/`payments`/`customers` ở backend.
