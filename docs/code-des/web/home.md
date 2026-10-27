# Web — Trang chủ (`/`)

Các khối xếp theo thứ tự từ trên xuống; khối nào rỗng thì tự ẩn.

1. **`BannerSlider`** — carousel banner lấy từ admin (mục Banner, vị trí "Trang chủ"). Tự chuyển, vuốt trên điện thoại, nút mũi tên trên máy tính. Không có banner đang bật thì không hiện gì.
2. **`HomeBlocks` (`after_hero`)** — khối nội dung admin tự soạn (mục "Khối trang chủ") đặt ngay dưới banner.
3. **`CategoryGrid`** — "Danh mục sản phẩm": dải ngang tự lướt vòng (`AutoScrollTrack`), mỗi ô gồm ảnh + tên + số sản phẩm. Chỉ hiện danh mục có ít nhất 1 sản phẩm.
4. **`HomeBlocks` (`after_categories`)**
5. **`FeaturedProducts`** — lưới tối đa 8 sản phẩm: ưu tiên sản phẩm "nổi bật", thiếu thì bù bằng sản phẩm mới nhất cho đủ 8 ô. Nút "Xem thêm" → `/products`.
6. **`HomeBlocks` (`after_products`)**
7. **`BlogPreview`** — "Tin tức": 6 bài mới nhất, dải ngang tự lướt vòng. Nút "Xem thêm" → `/news`.
8. **`HomeBlocks` (`after_news`)**

Có một `<h1 class="sr-only">` mang tên cửa hàng cho Google / trình đọc màn hình.
Khối trang chủ có thể có khung (`framed`, bọc trong `SectionCard`) hoặc không khung (nằm thẳng trên nền).

**Code**

`apps/web/src/app/page.tsx` — gọi song song `getBanners()`, `getCategories()`, `getProducts({ featured, limit: 8 })`, `getPosts(6)`, `getHomeBlocks()`, `getSettings()` rồi ghép các khối.

Component trong `apps/web/src/components/home/`:

- `banner-slider.tsx` — banner trượt
- `category-grid.tsx` — lưới danh mục
- `featured-products.tsx` — lưới sản phẩm
- `blog-preview.tsx` — tin tức mới
- `home-blocks.tsx` — khối nội dung admin soạn, lọc theo `position`
- `auto-scroll-track.tsx` — dải ngang tự lướt vòng (nhân đôi phần tử để lặp liền mạch; tạm dừng khi chạm / rê chuột; tắt khi người dùng bật "giảm chuyển động")

Dùng thêm: `components/post/post-card.tsx`, `components/ui/section-card.tsx`, `components/ui/rich-content.tsx`.

Admin quản lý: [banners](../admin/banners.md), [home-blocks](../admin/home-blocks.md).
