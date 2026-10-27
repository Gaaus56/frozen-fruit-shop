# Admin — Khối trang chủ (`/home-blocks`, `/home-blocks/new`, `/home-blocks/[id]`)

Cần quyền `homeBlocks`. Khối nội dung tự soạn (giới thiệu, câu chuyện, khuyến mãi…) xen giữa các phần có sẵn của trang chủ.

## Danh sách

**`Table`** — tiêu đề (link sửa), vị trí, kiểu (Trong khung / Không khung), thứ tự, trạng thái (Đang hiển thị / Đang ẩn), nút Sửa + `DeleteButton`.

## Form thêm / sửa (`HomeBlockForm`)

- Tiêu đề khối (không bắt buộc — khối không tiêu đề chỉ hiện nội dung)
- Nội dung (`RichTextEditor`, có ô sản phẩm)
- **Vị trí** trên trang chủ: `after_hero` · `after_categories` · `after_products` · `after_news`
- Thứ tự (nhiều khối cùng vị trí: số nhỏ hiện trước)
- "Đặt trong khung trắng bo góc" (`framed`) và "Hiển thị trên trang chủ"

**Code**

- `apps/admin/src/app/(dashboard)/home-blocks/page.tsx` — gọi `api<HomeBlock[]>("/admin/home-blocks")`
- `home-blocks/new/page.tsx`, `home-blocks/[id]/page.tsx`, `home-blocks/home-block-form.tsx`
- `home-blocks/actions.ts`, `home-blocks/layout.tsx`

API: [content](../api/content.md). Web: [home](../web/home.md).
