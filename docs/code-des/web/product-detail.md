# Web — Chi tiết sản phẩm (`/products/[slug]`)

1. **Khung thông tin mua hàng** (hai cột trong một khung trắng):
   - **`ProductGallery`** (trái) — ảnh dạng dải trượt: tự chuyển 4 giây, vuốt trên điện thoại, nút ‹ › trên máy tính, ảnh nhỏ bên dưới.
   - **Cột phải** — `BackButton` + tên danh mục (link lọc), tên sản phẩm, mô tả ngắn, rồi **`AddToCartForm`**.
2. **`AddToCartForm`** — chọn quy cách (nút bấm, mờ nếu hết hàng), giá + giá gạch + giá/kg qua `Price`, trạng thái (Còn hàng / Sắp hết hàng / Đã hết), bộ đếm số lượng 1–99, hai nút "Thêm vào giỏ hàng" và "Mua ngay" (thêm giỏ rồi chuyển `/cart`).
3. **Thẻ cam kết** — tối đa 3 thẻ dưới nút mua (icon + tiêu đề + mô tả, có thể là link). Nội dung do admin chỉnh ở *Thông tin cửa hàng → Thẻ cam kết*, hỗ trợ placeholder điền từ thông tin cửa hàng (`fillSettingsPlaceholders`). Link tới chính sách đã tắt / xoá thì bỏ link.
4. **"Thông tin sản phẩm"** (`SectionCard`) — bảng thông số (danh mục, bảo quản, hạn sử dụng, rã đông; dòng nào trống thì bỏ) + mô tả chi tiết là HTML rich text (`RichContent`). Chỉ hiện nếu có ít nhất một trong hai.
5. **"Sản phẩm cùng loại"** — `ProductGrid` từ `product.relatedProducts`, chỉ hiện khi có.

`generateMetadata` đặt title / description / ảnh OpenGraph theo sản phẩm; không có sản phẩm → `notFound()`.

**Code**

`apps/web/src/app/products/[slug]/page.tsx` — gọi `getProduct(slug)`, `getSettings()`, `getPolicies()`. Có `loading.tsx`.

- `components/product/product-gallery.tsx`, `add-to-cart-form.tsx`, `price.tsx`, `product-grid.tsx` → `product-card.tsx`
- `components/ui/rich-content.tsx`, `section-card.tsx`, `back-button.tsx`, `line-icon.tsx` (`AssuranceIconView`)
- `packages/types`: `fillSettingsPlaceholders`, `ProductAssurance`

> Trang **không còn** liên kết "Báo giá sỉ" (đã gỡ cùng trang `/wholesale`).
