# API — Categories (`/categories`, `/admin/categories`)

| Method & đường dẫn | Quyền | Mô tả |
|---|---|---|
| `GET /categories` | công khai | Danh mục đang hiển thị, kèm `productCount` = số sản phẩm đang bán trong danh mục |
| `GET /admin/categories` | `categories` **hoặc** `products` | Tất cả danh mục (form sản phẩm cần để chọn) |
| `GET /admin/categories/:id` | `categories` | Chi tiết |
| `POST /admin/categories` | `categories` | Tạo — slug để trống thì tự tạo từ tên |
| `PATCH /admin/categories/:id` | `categories` | Sửa |
| `DELETE /admin/categories/:id` | `categories` | Xoá — **chặn (409)** nếu còn sản phẩm; hướng dẫn chuyển / xoá sản phẩm hoặc tắt hiển thị |

Tắt `isActive` của danh mục sẽ ẩn cả danh mục lẫn toàn bộ sản phẩm trong đó khỏi web (điều kiện `publicWhere` của sản phẩm). Mọi thao tác ghi gọi `notify('catalog')`.

**Code**

- `apps/api/src/categories/categories.module.ts` — gồm DTO, `CategoriesService`, `PublicCategoriesController`, `AdminCategoriesController`

Admin: [categories](../admin/categories.md).
