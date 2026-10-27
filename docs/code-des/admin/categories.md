# Admin — Danh mục (`/categories`, `/categories/new`, `/categories/[id]`)

Cần quyền `categories`.

## Danh sách

**`Table`** — ảnh, tên (link sửa) + slug, số sản phẩm, thứ tự hiển thị, trạng thái (Đang hiển thị / Đang ẩn), nút Sửa + `DeleteButton`.

## Form thêm / sửa (`CategoryForm`)

Tên, slug (để trống tự tạo từ tên), mô tả ngắn (hiện ở đầu trang sản phẩm khi khách lọc danh mục), ảnh đại diện (`ImageUpload`), thứ tự hiển thị, "Hiển thị trên website" (tắt thì ẩn cả danh mục lẫn toàn bộ sản phẩm trong đó khỏi web).

Không xoá được danh mục còn sản phẩm — API trả lỗi yêu cầu chuyển / xoá sản phẩm trước hoặc tắt hiển thị.

**Code**

- `apps/admin/src/app/(dashboard)/categories/page.tsx` — gọi `api<Category[]>("/admin/categories")`
- `categories/new/page.tsx`, `categories/[id]/page.tsx`, `categories/category-form.tsx`
- `categories/actions.ts`, `categories/layout.tsx`

API: [categories](../api/categories.md).
