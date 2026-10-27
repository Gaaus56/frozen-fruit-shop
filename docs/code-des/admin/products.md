# Admin — Sản phẩm (`/products`, `/products/new`, `/products/[id]`)

Cần quyền `products`.

## Danh sách (`/products`)

1. **Form lọc** — tìm theo tên, lọc theo danh mục, lọc theo trạng thái (Đang bán / Đang ẩn). Nếu chưa có danh mục thì nút "Tạo danh mục trước".
2. **`Table`** — ảnh nhỏ, tên (link sửa) + nhãn "Nổi bật" / "Chưa có ảnh", danh mục, khoảng giá + số quy cách, tồn kho (Badge hết hàng / sắp hết / còn hàng), công tắc "Đang bán" (bật / tắt nhanh không cần vào form), nút Sửa + `DeleteButton`.

## Form thêm / sửa (`ProductForm`)

1. **"Thông tin cơ bản"** — tên, mô tả ngắn (1–2 câu hiện dưới tên sản phẩm), mô tả chi tiết (**`RichTextEditor`**: in đậm, chia mục, chèn ảnh có chú thích).
2. **"Hình ảnh"** — **`ImageListUpload`** (tối đa 12 ảnh, kéo sắp thứ tự; ảnh đầu là ảnh đại diện; ảnh lớn tự thu nhỏ và nén).
3. **"Quy cách đóng gói & giá"** — **`VariantEditor`**: thêm / xoá nhiều quy cách; mỗi quy cách có tên gói, khối lượng (gram — để web hiện giá/kg), giá, giá so sánh (gạch ngang), tồn kho (`in_stock` / `low_stock` / `out_of_stock`), SKU, bật / tắt.
4. **"Bảo quản & sử dụng"** — nhiệt độ bảo quản, hạn sử dụng (ngày), hướng dẫn rã đông.
5. **"Phân loại & hiển thị"** (cột phải) — danh mục, "Đang bán trên website", "Sản phẩm nổi bật" (hiện ở trang chủ), thứ tự hiển thị, slug (để trống tự tạo từ tên).

> Ô "Cho phép mua sỉ" **đã bỏ** cùng tính năng sỉ.

Quy cách không gửi lên khi lưu sẽ bị xoá; quy cách có id được cập nhật tại chỗ để đơn hàng cũ vẫn trỏ đúng.

**Code**

- `apps/admin/src/app/(dashboard)/products/page.tsx` — gọi `api<Product[]>("/admin/products?...")` và `api<Category[]>("/admin/categories")`
- `products/new/page.tsx`, `products/[id]/page.tsx`
- `products/product-form.tsx` (form dùng chung), `products/variant-editor.tsx`
- `products/actions.ts` (`saveProductAction`, `toggleProductActiveAction`, `deleteProductAction`), `products/layout.tsx`
- `components/ui/image-upload.tsx` (`ImageListUpload`), `components/editor/rich-text-editor.tsx`

API: [products](../api/products.md).
