# Web — Danh sách sản phẩm (`/products`)

Đọc query `?category=&q=&sort=`; mọi bộ lọc là link (không cần JS).

1. **`PageHero`** — ảnh nền là banner admin tạo cho vị trí "Sản phẩm" (không có thì dùng ảnh mặc định `banner_v3.jpg`). Tiêu đề là tên danh mục đang lọc hoặc "Tất cả trái cây đông lạnh"; khi đang tìm kiếm hiện "Kết quả tìm kiếm cho … — N sản phẩm".
2. **`FilterChips`** — chip "Tất cả" + từng danh mục; có chip xoá từ khoá khi đang tìm.
3. **Thanh sắp xếp** — Nổi bật / Mới nhất / Giá thấp → cao / Giá cao → thấp (`?sort=`).
4. **`ProductGrid`** — lưới `ProductCard`. Rỗng thì hiện thông báo theo ngữ cảnh (không khớp từ khoá / chưa có sản phẩm) kèm nút "Xem tất cả sản phẩm" nếu đang lọc.
5. **`ProductCard`** (lặp trong lưới) — ảnh, nhãn "Hết hàng" / "Nổi bật", tên, giá của quy cách rẻ nhất còn hàng (kèm giá gạch), nút "+" thêm nhanh vào giỏ.

**Code**

`apps/web/src/app/products/page.tsx` — gọi `getCategories()`, `getProducts({ category, q, sort })`, `getBanners("products")`. Có `loading.tsx` làm khung chờ.

- `components/product/product-grid.tsx`, `product-card.tsx`, `price.tsx`, `product-image.tsx` (ảnh có fallback placeholder), `product-skeleton.tsx`
- `components/ui/page-hero.tsx`, `filter-chips.tsx`, `container.tsx`, `line-icon.tsx`
- `lib/edit-target.ts` (đánh dấu banner sửa được cho trang Xem trước)

Admin quản lý: [products](../admin/products.md), [categories](../admin/categories.md), [banners](../admin/banners.md).
