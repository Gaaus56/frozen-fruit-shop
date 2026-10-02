# Website khách hàng (`apps/web`)

Next.js 16 App Router + Tailwind CSS 4. Chạy ở cổng 3000. Giao diện đỏ – xanh lá – nền sáng theo logo cửa hàng; không có chế độ tối.

## 1. Trang và chức năng

| Đường dẫn | Chức năng |
|---|---|
| `/` | Banner trình chiếu (ẩn nếu chưa có banner), giới thiệu, danh mục, sản phẩm nổi bật, bài viết mới |
| `/products` | Danh sách sản phẩm; lọc theo danh mục (`?category=`), tìm kiếm (`?q=`, gõ có dấu hoặc không dấu đều được), sắp xếp (`?sort=` newest / price_asc / price_desc) |
| `/products/[slug]` | Chi tiết: thư viện ảnh, chọn quy cách, giá/giá gốc/% giảm, giá quy đổi/kg, tình trạng kho, bảo quản & rã đông, sản phẩm liên quan, thêm giỏ / mua ngay |
| `/cart` | Giỏ hàng: sửa số lượng (1–99), xoá; giá được API kiểm tra lại, báo dòng hết hàng/ngừng bán |
| `/checkout` | Thông tin nhận hàng, phương thức thanh toán (COD / chuyển khoản — hiện thông tin tài khoản từ cài đặt cửa hàng), đặt hàng |
| `/order-lookup` | Tra cứu đơn bằng mã đơn + số điện thoại; hiển thị trạng thái đơn, trạng thái thanh toán, sản phẩm và chi tiết tiền |
| `/wholesale` | Đặt hàng sỉ / F&B: danh sách sản phẩm nhận sỉ + form yêu cầu báo giá |
| `/contact` | Thông tin liên hệ, bản đồ, form liên hệ |
| `/about` | Giới thiệu cửa hàng |
| `/news`, `/news/[slug]` | Bài viết (chỉ bài đã bật và đã tới ngày đăng) |
| `/policies/[slug]` | Trang chính sách (liệt kê ở chân trang) |
| `/api/revalidate` | Route nội bộ cho API báo xoá cache (cần khoá bí mật) |

Thành phần chung:
- **Header**: logo, dải chữ chạy (lấy từ cài đặt hoặc tự ghép hotline/địa chỉ), menu danh mục, nút tìm kiếm mở ô tìm dưới nút (desktop + mobile), giỏ hàng có số lượng.
- **Footer**: thông tin cửa hàng, danh mục, chính sách, liên hệ, mã số thuế.
- **Nút liên hệ nổi**: gọi hotline, Zalo, Facebook — tất cả liên kết ngoài mở tab mới.

## 2. Lấy dữ liệu

| File | Chạy ở | Dùng cho |
|---|---|---|
| `src/lib/api.ts` | Server | Đọc dữ liệu công khai khi render trang. `fetch` với `next: { revalidate: 300, tags }`. Lỗi mạng → trả dữ liệu dự phòng (thông tin cửa hàng mặc định `DEFAULT_SITE_SETTINGS`, danh sách rỗng) và ghi log, trang không sập |
| `src/lib/api-client.ts` | Trình duyệt | Báo giá giỏ hàng, tạo đơn, tra cứu đơn, gửi liên hệ/báo giá sỉ |

Cache tag: `catalog` (sản phẩm, danh mục), `content` (bài viết, banner, chính sách), `settings` (thông tin cửa hàng). API gọi `/api/revalidate` khi dữ liệu tương ứng thay đổi.

**Realtime**: `components/layout/live-updates.tsx` (trong layout gốc) nghe `GET {NEXT_PUBLIC_API_URL}/events`. Admin sửa dữ liệu → trang khách đang mở tự `router.refresh()` sau khi cache đã xoá, không mất giỏ hàng; trang thanh toán báo giá lại (sự kiện window `traicay28:data-changed`). Chi tiết: [request-flows.md](../02-architecture/request-flows.md#5-cập-nhật-realtime).

Ảnh sản phẩm dùng `next/image`; `next.config.ts` chỉ cho phép ảnh từ `${NEXT_PUBLIC_API_URL}/uploads/**`. Sản phẩm chưa có ảnh hiển thị `public/images/placeholder.svg`.

## 3. Giỏ hàng

- `src/lib/cart-context.tsx` — React context, lưu `localStorage` khoá `traicay28:cart:v2`.
- Mỗi dòng lưu `variantId`, số lượng và bản chụp hiển thị (tên, quy cách, ảnh, giá). `isHydrated` tránh nhấp nháy khi tải trang.
- `applyQuote()` cập nhật giá/tên theo kết quả `POST /orders/quote`; dòng không còn hợp lệ được đánh dấu để khách xoá.

## 4. Form

- Các form (liên hệ, báo giá sỉ, đặt hàng) có trường ẩn `website` (honeypot) — bot điền vào sẽ bị API bỏ qua.
- Lỗi từ API (định dạng số điện thoại, quá số lần gửi...) hiển thị ngay trên form bằng tiếng Việt.

## 5. Biến môi trường (`apps/web/.env.local`)

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Có | URL công khai của API (trình duyệt gọi, và là tên miền ảnh). **Đóng gói vào mã lúc build** — đổi phải build lại |
| `API_URL` | Không | URL API cho server web (vd. mạng nội bộ Docker `http://api:4000`); trống → dùng `NEXT_PUBLIC_API_URL` |
| `REVALIDATE_SECRET` | Có (để làm mới ngay) | Phải trùng `REVALIDATE_SECRET` của API |
