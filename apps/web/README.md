# Trái Cây 28 — Web khách hàng

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind CSS 4. Đây là workspace con của monorepo; chạy lệnh từ **thư mục gốc repo**.

## Chạy cục bộ

```bash
cp apps/web/.env.example apps/web/.env.local
npm run dev:web          # http://localhost:3000 (cần API chạy ở :4000)
```

| Biến | Ý nghĩa |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL công khai của API: trình duyệt gọi để đặt hàng, tra cứu, liên hệ; cũng là tên miền ảnh |
| `API_URL` | (Tuỳ chọn) URL API cho server web khi render trang |
| `REVALIDATE_SECRET` | Trùng với API, để API báo web xoá cache khi admin sửa dữ liệu |
| `NEXT_PUBLIC_ADMIN_URL` | Trang admin, được phép mở web trong khung "Xem trước & sửa" |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_*` | (Tuỳ chọn) Theo dõi lỗi bằng Sentry |
| `DESIGNER_NAME`, `DESIGNER_URL` | (Tuỳ chọn) Dòng "Designed by" ở footer |

## Trang

| Đường dẫn | Nội dung |
|---|---|
| `/` | Trang chủ: banner, khối nội dung do admin sắp xếp |
| `/products`, `/products/[slug]` | Danh sách, chi tiết sản phẩm (ảnh tự lướt, vuốt trên điện thoại) |
| `/cart`, `/checkout` | Giỏ hàng, đặt hàng (thanh toán COD) |
| `/order-lookup` | Tra cứu đơn theo mã đơn + số điện thoại, xem lại bill đã lưu |
| `/news`, `/policies`, `/about`, `/contact` | Bài viết, chính sách, giới thiệu, liên hệ |
| `/revalidate`, `/api/*` | Endpoint nội bộ (API gọi để xoá cache) |

## Cấu trúc

```
src/
├── app/            # trang (App Router), error / not-found, globals.css (màu, hiệu ứng)
├── components/     # ui/ (icon, nút, form), product/, checkout/, receipt/, contact/, layout/…
├── lib/
│   ├── api.ts          # lấy dữ liệu phía server (có cache tag)
│   ├── api-client.ts   # gọi API từ trình duyệt (đặt hàng, liên hệ, tra cứu)
│   └── …               # định dạng, bill, vuốt, SSE
├── instrumentation*.ts # Sentry
```

## Kiểm tra & build

```bash
npm run lint:web
npx tsc --noEmit -p apps/web
npm run build:web
```

Deploy: Vercel, Root Directory `apps/web`.
