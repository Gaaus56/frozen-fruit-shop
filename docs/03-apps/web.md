# Website khách hàng (`apps/web`)

Next.js 16 App Router + Tailwind CSS 4. Chạy ở cổng 3000. Giao diện đỏ – xanh lá – nền sáng theo logo cửa hàng; không có chế độ tối.

## 1. Trang và chức năng

| Đường dẫn | Chức năng |
|---|---|
| `/` | Banner trình chiếu (ẩn nếu chưa có banner), giới thiệu, danh mục, sản phẩm nổi bật, bài viết mới |
| `/products` | Danh sách sản phẩm; ảnh nền + tiêu đề đầu trang lấy từ banner vị trí "Đầu trang Sản phẩm"; lọc theo danh mục (`?category=`, ẩn danh mục chưa có sản phẩm), tìm kiếm (`?q=`, có dấu hoặc không dấu, có chip xoá từ khoá), sắp xếp (`?sort=` newest / price_asc / price_desc); khung chờ khi đổi bộ lọc |
| `/products/[slug]` | Chi tiết: thư viện ảnh, chọn quy cách, giá/giá gốc/% giảm, giá quy đổi/kg, tình trạng kho, bảo quản & rã đông, sản phẩm liên quan, thêm giỏ / mua ngay |
| `/cart` | Giỏ hàng: sửa số lượng (1–99), xoá; giá được API kiểm tra lại, báo dòng hết hàng/ngừng bán |
| `/checkout` | Thông tin nhận hàng, đặt hàng (chỉ COD — thu tiền khi giao) |
| `/order-lookup` | Tra cứu đơn bằng mã đơn + số điện thoại; hiển thị trạng thái đơn, trạng thái thanh toán, sản phẩm và chi tiết tiền |
| `/contact` | Thông tin liên hệ, bản đồ, form liên hệ |
| `/about` | Giới thiệu cửa hàng — nội dung admin sửa ở "Trang Giới thiệu" (`GET /pages/about`) |
| `/news/[slug]` | Bài nằm trong khung trắng bo góc (giống khối trang chủ) căn giữa; nhãn loại → tiêu đề → ngày đăng (xám); không có breadcrumb |
| `/news/[slug]` — phần cuối bài | **Mục lục** ("Nội dung:", tự lấy từ Tiêu đề / Tiêu đề nhỏ khi bài có ≥ 2 tiêu đề; đánh số 1 / 1.1; bấm cuộn mượt tới mục; thu gọn được) · **Xem thêm** (5 bài mới nhất cùng loại, thiếu thì lấy loại khác) · **Bình luận** đã duyệt + câu trả lời của cửa hàng · form **Để lại một bình luận** (tên, email không công khai, nội dung, "lưu tên và email" trên trình duyệt) |
| `/news`, `/news/[slug]` | Bài viết (chỉ bài đã bật và đã tới ngày đăng). Đầu trang có ảnh nền (banner vị trí "Đầu trang Tin tức") và chip lọc Tất cả / Kiến thức / Tuyển dụng (`?type=kien-thuc` / `tuyen-dung`) — cùng khung `PageHero` + `FilterChips` với trang Sản phẩm; bài tuyển dụng có khối Ứng tuyển (Zalo, gọi, email) |
| `/policies/[slug]` | Trang chính sách (liệt kê ở chân trang) |
| `/api/revalidate` | Route nội bộ cho API báo xoá cache (cần khoá bí mật) |

Thành phần chung:
- **Header**: logo, dải chữ chạy (lấy từ cài đặt hoặc tự ghép hotline/địa chỉ), menu (Sản phẩm thả xuống danh mục, Tin tức thả xuống Kiến thức / Tuyển dụng), nút tìm kiếm mở ô tìm dưới nút (desktop + mobile), giỏ hàng có số lượng.
- **Hiệu ứng**: menu thả xuống (Sản phẩm, Tin tức) chảy xuống khi mở, cuộn lên khi đóng; danh sách nút liên hệ mở từ dưới lên, từng mục hiện lần lượt (`.nav-dropdown`, `.contact-menu` trong `globals.css`; tắt khi người dùng bật giảm chuyển động).
- **Thanh dưới (điện thoại)**: Trang chủ · Sản phẩm · [nút liên hệ tròn] · Giới thiệu · Tin tức. Không có tab Liên hệ vì nút tròn đã làm việc đó; trang `/contact` vào từ chân trang.
- **Footer**: thông tin cửa hàng, danh mục, chính sách, liên hệ, mã số thuế.
- **Nút liên hệ nổi**: gọi hotline, Zalo, Facebook — tất cả liên kết ngoài mở tab mới.

## 2. Lấy dữ liệu

| File | Chạy ở | Dùng cho |
|---|---|---|
| `src/lib/api.ts` | Server | Đọc dữ liệu công khai khi render trang. `fetch` với `next: { revalidate: 300, tags }`. Lỗi mạng → trả dữ liệu dự phòng (thông tin cửa hàng mặc định `DEFAULT_SITE_SETTINGS`, danh sách rỗng) và ghi log, trang không sập |
| `src/lib/api-client.ts` | Trình duyệt | Báo giá giỏ hàng, tạo đơn, tra cứu đơn, gửi liên hệ |

Cache tag: `catalog` (sản phẩm, danh mục), `content` (bài viết, banner, chính sách), `settings` (thông tin cửa hàng). API gọi `/api/revalidate` khi dữ liệu tương ứng thay đổi.

**Realtime**: `components/layout/live-updates.tsx` (trong layout gốc) nghe `GET {NEXT_PUBLIC_API_URL}/events`. Admin sửa dữ liệu → trang khách đang mở tự `router.refresh()` sau khi cache đã xoá, không mất giỏ hàng; trang thanh toán báo giá lại (sự kiện window `traicay28:data-changed`). Chi tiết: [request-flows.md](../02-architecture/request-flows.md#5-cập-nhật-realtime).

Ảnh sản phẩm dùng `next/image`; `next.config.ts` chỉ cho phép ảnh từ `${NEXT_PUBLIC_API_URL}/uploads/**`. Sản phẩm chưa có ảnh hiển thị `public/images/placeholder.svg`.

## 3. Nội dung có định dạng

`components/ui/rich-content.tsx` hiển thị HTML của bài viết, chính sách, trang Giới thiệu, mô tả sản phẩm:
- Tách HTML tại các ô sản phẩm `<div data-product-slug="…">` **và** các dòng chỉ chứa link sản phẩm `<p><a href="…/products/slug">…</a></p>`; thay bằng `ProductCard` (cùng thẻ trang Sản phẩm: ảnh, nhãn, giá hiện tại, nút thêm giỏ) lấy từ `GET /products/:slug`. Nhiều thẻ liền nhau (chỉ cách nhau dòng trống) gom thành **một hàng ngang** hiện 2 / 3 / 4 thẻ (điện thoại / tablet / máy tính), **tự lướt** mỗi 5 giây như khối Danh mục trang chủ (`AutoScrollTrack`) khi nhiều sản phẩm hơn số thẻ hiện được; khách vuốt tay được, chạm vào thì tạm dừng. Sản phẩm đã ẩn / xoá thì bỏ qua.
- Kiểu chữ ở `.rich-content` trong `globals.css` (giữ giống `.rich-editor-content` của admin). Ảnh giữ kích thước gốc, tối đa rộng khung, bo góc; chú thích căn giữa.
- HTML đã được API lọc nên render bằng `dangerouslySetInnerHTML` an toàn.

## 4. Giỏ hàng

- `src/lib/cart-context.tsx` — React context, lưu `localStorage` khoá `traicay28:cart:v2`.
- Mỗi dòng lưu `variantId`, số lượng và bản chụp hiển thị (tên, quy cách, ảnh, giá). `isHydrated` tránh nhấp nháy khi tải trang.
- `applyQuote()` cập nhật giá/tên theo kết quả `POST /orders/quote`; dòng không còn hợp lệ được đánh dấu để khách xoá.

## 5. Form

- Các form (liên hệ, đặt hàng) có trường ẩn `website` (honeypot) — bot điền vào sẽ bị API bỏ qua.
- Lỗi từ API (định dạng số điện thoại, quá số lần gửi...) hiển thị ngay trên form bằng tiếng Việt.

## 6. Biến môi trường (`apps/web/.env.local`)

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Có | URL công khai của API (trình duyệt gọi, và là tên miền ảnh). **Đóng gói vào mã lúc build** — đổi phải build lại |
| `API_URL` | Không | URL API cho server web (vd. mạng nội bộ Docker `http://api:4000`); trống → dùng `NEXT_PUBLIC_API_URL` |
| `REVALIDATE_SECRET` | Có (để làm mới ngay) | Phải trùng `REVALIDATE_SECRET` của API |
