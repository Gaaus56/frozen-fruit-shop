# Admin — Bài viết (`/posts`, `/posts/new`, `/posts/[id]`)

Cần quyền `posts`. Hiển thị ở mục Tin tức trên web, chia 2 loại: **Kiến thức** và **Tuyển dụng**.

## Danh sách

Tab lọc theo loại; **`Table`** — ảnh bìa, tiêu đề (link sửa), loại bài, ngày đăng, trạng thái (Bản nháp / Hẹn giờ đăng / Đang hiển thị — tự nhận biết bài có `publishedAt` trong tương lai), nút Sửa + `DeleteButton`.

## Form viết / sửa (`PostForm`)

1. **"Nội dung"** — tiêu đề, tóm tắt (hiện ở thẻ bài và khi chia sẻ), nội dung (`RichTextEditor`: ảnh có chú thích, ô sản phẩm, 2 cột, khung ghi chú…).
2. **"Xuất bản"** — "Hiển thị trên website", ngày đăng (`datetime-local`, giờ Việt Nam — đặt tương lai = hẹn giờ; trống = ngay bây giờ), loại bài (Tuyển dụng có thêm khối "Ứng tuyển" cuối bài), slug.
3. **"Ảnh bìa"** — `ImageUpload`.

Loại "Tin sỉ" đã bỏ khỏi `PostType`; chỉ còn `knowledge` và `recruitment`.

**Code**

- `apps/admin/src/app/(dashboard)/posts/page.tsx` — gọi `api<Post[]>("/admin/posts")`
- `posts/new/page.tsx`, `posts/[id]/page.tsx`, `posts/post-form.tsx`
- `posts/actions.ts`, `posts/layout.tsx`
- `components/editor/rich-text-editor.tsx`, `lib/product-options.ts` (danh sách sản phẩm để chèn ô sản phẩm)

API: [content](../api/content.md). Web: [news](../web/news.md), [news-detail](../web/news-detail.md).
