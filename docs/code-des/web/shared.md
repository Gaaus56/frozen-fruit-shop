# Web — thành phần dùng chung

Mọi trang của `apps/web` nằm trong một layout gốc và dùng chung một số khối, thư mục và lớp dữ liệu.

## Layout chung (không nằm trong từng `page.tsx`)

1. **`Header`** — dải chữ chạy đỏ (bật/tắt và sửa chữ ở Thông tin cửa hàng) + thanh cam kết (Chuẩn VietGAP, Không chất bảo quản, Hút chân không, Giao hàng lạnh toàn quốc) + logo + menu (Trang chủ, Sản phẩm, Giới thiệu, Tin tức, Liên hệ) + ô tìm kiếm + icon giỏ hàng có số lượng.
   - Mục *Sản phẩm* xổ ra danh sách danh mục, mục *Tin tức* xổ ra 2 loại bài (Kiến thức / Tuyển dụng).
   - Ô tìm kiếm chuyển sang `/products?q=...`.
   - Trên điện thoại có **thanh điều hướng dưới** (Trang chủ / Sản phẩm / Giới thiệu / Tin tức…).
2. **`Footer`** — cột Liên hệ, cột Chính sách (các chính sách đang bật + link "Tra cứu đơn hàng"), khung Fanpage Facebook (theo link trong Thông tin cửa hàng), dòng "Copyright © … Designed by …" (đặt `DESIGNER_NAME` / `DESIGNER_URL` trong `.env.local`; để trống thì ẩn).
3. **`FloatingContact`** — nút liên hệ nổi, xoay vòng icon Messenger / Zalo / SMS / Gọi; bấm mở popup chọn kênh. Kênh Messenger ẩn khi chưa có link Facebook; trên mobile có thêm mục "Trang liên hệ".
4. **`LiveUpdates`** — không hiện gì; nghe SSE từ API (`/events`), khi admin sửa dữ liệu thì `router.refresh()` trang đang mở (đợi tab được focus nếu đang ẩn) và phát sự kiện `DATA_CHANGED_EVENT` để giỏ hàng / thanh toán báo giá lại.
5. **`NavigationTracker`** — ghi nhận khách đã chuyển trang trong web để `BackButton` biết quay về trang trước hay về link dự phòng.
6. **`PreviewEditOverlay`** — chỉ hoạt động khi web được nhúng trong trang "Xem trước & sửa" của admin: rê chuột vào phần có `editTarget` → viền đỏ, bấm đúp → báo admin mở trang sửa. Khách xem bình thường không thấy gì. Xem [admin/preview.md](../admin/preview.md).
7. **`CartProvider`** — bọc toàn bộ trang, cấp context giỏ hàng.

**Code**

`apps/web/src/app/layout.tsx` — gọi song song `getSettings()`, `getCategories()`, `getPolicies()` rồi truyền xuống `Header` / `Footer` / `FloatingContact`.

- `apps/web/src/components/layout/header.tsx`, `footer.tsx`, `floating-contact.tsx`, `live-updates.tsx`, `logo-badge.tsx`, `preview-edit-overlay.tsx`
- `apps/web/src/components/ui/back-button.tsx` (`BackButton`, `NavigationTracker`)
- `apps/web/src/lib/cart-context.tsx` (`CartProvider`)

Ngoài ra: `app/error.tsx`, `app/global-error.tsx` (trang lỗi, tự gửi lỗi lên Sentry khi có `NEXT_PUBLIC_SENTRY_DSN`), `app/not-found.tsx` (404); `src/instrumentation.ts` + `instrumentation-client.ts` khởi tạo Sentry ([api/core.md](../api/core.md#theo-dõi-lỗi-sentry)); `app/products/loading.tsx` và `products/[slug]/loading.tsx` (khung chờ, dùng `product-skeleton.tsx`).

## Route nội bộ

- `apps/web/src/app/api/revalidate/route.ts` — `POST` kèm header `x-revalidate-secret`; API gọi để xoá cache theo tag (`catalog` / `content` / `settings`). Xem [api/revalidate.md](../api/revalidate.md).

## Thư mục dùng chung

**`apps/web/src/components/ui/`**

- `container.tsx` — khung căn giữa + padding ngang chuẩn
- `button.tsx` — `Button`, `LinkButton`, `buttonClass` (primary / secondary / dark / danger / ghost)
- `form.tsx` — `Field`, `FormMessage`, `HoneypotField` (chống bot), `inputClass`
- `section-heading.tsx` — tiêu đề khối (eyebrow + title + description)
- `section-card.tsx` — `SectionCard` (khung trắng bo góc của các khối trang chủ / chi tiết), `SectionTitle`
- `page-hero.tsx` — đầu trang có ảnh nền + tiêu đề + chip lọc (Sản phẩm, Tin tức, Giới thiệu)
- `filter-chips.tsx` — `FilterChips`, `FilterChip`, `ClearFilterChip`
- `rich-content.tsx` — hiển thị HTML do admin soạn (đã được API lọc), tự dựng **thẻ sản phẩm** và **khối 2 cột** bên trong nội dung
- `back-button.tsx`, `line-icon.tsx` (icon trạng thái rỗng + icon thẻ cam kết), `check-icon.tsx` (`SuccessCheck`)

**`apps/web/src/components/product/`** — dùng ở trang chủ, `/products`, `/products/[slug]`, `/cart`, `/checkout` và trong nội dung bài viết:

- `product-image.tsx`, `product-card.tsx`, `product-grid.tsx`, `product-gallery.tsx`, `add-to-cart-form.tsx`, `price.tsx`, `product-skeleton.tsx`

**`apps/web/src/lib/`** — lớp dữ liệu và tiện ích:

- `api.ts` — gọi API phía **server** (mọi `page.tsx` / `layout.tsx`); cache 5 phút + tag, có dữ liệu dự phòng khi API lỗi
- `api-client.ts` — gọi API phía **trình duyệt** (`quoteCart`, `placeOrder`, `lookupOrder`, `sendInquiry`, `sendComment`)
- `cart-context.tsx` — state giỏ hàng, lưu `localStorage` (key `traicay28:cart:v2`, tối đa 99 / dòng)
- `saved-receipts.ts` — bill khách đã xuất, lưu `localStorage` (tối đa 20 bill gần nhất)
- `receipt-content.ts`, `receipt-image.ts` — dựng nội dung bill và vẽ ảnh PNG bằng canvas
- `edit-target.ts` — `editTarget()` / `editSettings()` đánh dấu phần "sửa được" cho trang Xem trước
- `shared-event-source.ts` — một kết nối SSE dùng chung cho mọi tab (Web Lock + BroadcastChannel). Có bản sao ở admin, sửa thì sửa cả hai
- `map-embed.ts` (đổi link Google Maps → link nhúng), `rich-headings.ts` (mục lục bài), `use-swipe.ts` (vuốt banner / ảnh), `format.ts` (`formatCurrency`, `formatDate`)
