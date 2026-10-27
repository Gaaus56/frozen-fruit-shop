# Web — Tin tức (`/news`)

Đọc query `?type=kien-thuc` hoặc `?type=tuyen-dung` (giá trị lạ coi như xem tất cả).

1. **`PageHero`** — ảnh nền là banner vị trí "Tin tức" (không có thì `news-default.jpg`). Xem tất cả thì dùng chữ admin đặt trên banner; đang lọc một loại thì tiêu đề theo loại (Kiến thức / Tuyển dụng).
2. **`FilterChips`** — Tất cả / Kiến thức / Tuyển dụng.
3. **Lưới `PostCard`** — ảnh bìa, loại bài + ngày đăng, tiêu đề, trích đoạn (loại bài chỉ hiện khi xem tất cả).
4. **Trạng thái rỗng** — "Chưa có bài viết nào"; riêng mục Tuyển dụng gợi ý gửi thông tin qua Zalo của cửa hàng.

**Code**

`apps/web/src/app/news/page.tsx` — gọi `getPosts(undefined, type)`, `getSettings()`, `getBanners("news")` (khác trang chủ chỉ lấy 6 bài mới nhất).

- `components/post/post-card.tsx` → `components/product/product-image.tsx`
- `components/ui/page-hero.tsx`, `filter-chips.tsx`, `line-icon.tsx`
- `packages/types`: `POST_TYPES`, `POST_TYPE_LABELS`, `POST_TYPE_SLUGS`

Admin quản lý: [posts](../admin/posts.md).
