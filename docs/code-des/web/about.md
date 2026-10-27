# Web — Giới thiệu (`/about`)

Nội dung **do admin soạn** (không còn viết cứng trong code).

1. **`PageHero`** — ảnh nền là banner admin tạo cho vị trí "Giới thiệu" (không có thì ảnh mặc định). Tiêu đề / mô tả: ưu tiên chữ trên banner, rồi tiêu đề / mô tả của trang, cuối cùng là "Về {tên cửa hàng}".
2. **Nội dung trang** — HTML rich text của trang `about` trong khung trắng bo góc (`RichContent`). Chỉ hiện nếu có nội dung; API trả nội dung mặc định khi admin chưa sửa lần nào.

**Code**

`apps/web/src/app/about/page.tsx` — gọi `getPage("about")`, `getSettings()`, `getBanners("about")`.

- `components/ui/page-hero.tsx`, `rich-content.tsx`, `container.tsx`
- `lib/edit-target.ts`

Admin sửa ở mục *Trang Giới thiệu*: [pages](../admin/pages.md). API: [content](../api/content.md).
