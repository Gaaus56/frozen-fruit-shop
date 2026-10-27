# Admin — Trang Giới thiệu (`/pages/about`)

Cần quyền `pages`. Nội dung trang `/about` trên website: câu chuyện cửa hàng, cam kết chất lượng, hình ảnh. Hiện chỉ có một trang cố định `about`.

**`PageForm`** — tiêu đề trang, dòng giới thiệu ngắn (hiện dưới tiêu đề), nội dung (`RichTextEditor`: chia mục bằng Tiêu đề / Tiêu đề nhỏ, chèn ảnh có chú thích, ô sản phẩm).

Admin chưa sửa lần nào thì API trả **nội dung mặc định** (thay `{storeName}` bằng tên cửa hàng) để mở ra thấy đúng chữ đang hiển thị.

**Code**

- `apps/admin/src/app/(dashboard)/pages/about/page.tsx` — gọi `api<Page>("/admin/pages/about")`
- `pages/page-form.tsx`, `pages/actions.ts`, `pages/layout.tsx`

API: [content](../api/content.md). Web: [about](../web/about.md).
