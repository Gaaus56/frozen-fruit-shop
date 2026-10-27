# API — Products (`/products`, `/admin/products`)

| Method & đường dẫn | Quyền | Mô tả |
|---|---|---|
| `GET /products` | công khai | Sản phẩm đang bán. Query: `category` (slug), `q`, `featured=true`, `sort=default\|newest\|price_asc\|price_desc`, `limit` (1–100) |
| `GET /products/:slug` | công khai | Chi tiết (`ProductDetail`) kèm `relatedProducts` |
| `GET /admin/products` | `products` / `posts` / `pages` / `policies` / `homeBlocks` | Danh sách quản trị. Query: `q`, `categoryId`, `status=active\|inactive\|all`. Mở rộng quyền để người soạn nội dung chèn "ô sản phẩm" |
| `GET /admin/products/:id` | `products` | Chi tiết |
| `POST /admin/products` | `products` | Tạo |
| `PATCH /admin/products/:id` | `products` | Sửa |
| `DELETE /admin/products/:id` | `products` | Xoá |

## Quy tắc

- **"Đang bán" cho khách** (`publicWhere`): sản phẩm bật **và** danh mục bật **và** còn ít nhất 1 quy cách bật.
- **Tìm kiếm** theo tên (có dấu) hoặc theo slug (không dấu) để gõ "xoai" vẫn ra "Xoài".
- **Quy cách (`ProductVariantInput`)**: có `id` = sửa quy cách đang có, không có = thêm mới, không gửi lên = xoá. Cập nhật theo id để đơn cũ vẫn trỏ đúng. Tên quy cách không được trùng.
- `compareAtPrice` chỉ giữ khi lớn hơn `price`; `pricePerKg` tính từ `weightGrams`.
- **Mô tả chi tiết** là HTML, được `sanitizeRichText` lọc trước khi lưu.
- **Xoá sản phẩm**: đơn cũ giữ tên / giá đã lưu, `productId` / `variantId` chuyển thành `null`.
- Ảnh lưu đường dẫn tương đối `/uploads/...`, trả ra URL tuyệt đối.
- Mọi thao tác ghi gọi `notify('catalog')`.

> Trường `isWholesaleAvailable` và tham số lọc `wholesale` **không còn**.

**Code**

- `apps/api/src/products/products.module.ts`, `products.service.ts`, `products.dto.ts`

Admin: [products](../admin/products.md). Web: [products](../web/products.md), [product-detail](../web/product-detail.md).
