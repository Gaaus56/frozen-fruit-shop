# Cơ sở dữ liệu

PostgreSQL 16, truy cập qua Prisma 6. Định nghĩa: `apps/api/prisma/schema.prisma`. Tiền lưu bằng **số nguyên đồng** (`Int`), thời gian lưu UTC (thống kê tự quy đổi sang giờ Việt Nam). Khoá chính là `cuid` (chuỗi ngẫu nhiên, không đoán được).

## 1. Sơ đồ quan hệ

```
users ─────────────┐ (người đổi trạng thái; xoá user → changedById = NULL)
                   ▼
categories ─1:n─ products ─1:n─ product_images      (xoá sản phẩm → xoá ảnh)
   (Restrict)       │    └─1:n─ product_variants    (xoá sản phẩm → xoá quy cách)
                    │                 │
                    ▼ (SetNull)       ▼ (SetNull)
orders ─1:n─ order_items   ← lưu BẢN CHỤP tên, quy cách, đơn giá lúc đặt
   └──1:n─ order_status_logs

inquiries · posts · banners · policies · site_settings (1 dòng, id = 1)   — độc lập
```

## 2. Các bảng

| Bảng | Mục đích | Trường đáng chú ý |
|---|---|---|
| `users` | Tài khoản quản trị | `role` ADMIN/STAFF, `isActive`, `failedLoginCount` + `lockedUntil` (khoá sau 5 lần sai), `passwordChangedAt` (token cấp trước thời điểm này bị từ chối), `lastLoginAt` |
| `categories` | Danh mục | `slug` duy nhất, `image`, `sortOrder`, `isActive` (ẩn danh mục = ẩn luôn sản phẩm của nó trên web) |
| `products` | Sản phẩm | `categoryId`, mô tả ngắn/dài, `storageTemperature`, `shelfLifeDays`, `thawInstructions`, `isFeatured`, `isActive`, `sortOrder` |
| `product_images` | Ảnh sản phẩm | `url` (đường dẫn tương đối `/uploads/...`), `sortOrder` (0 = ảnh chính) |
| `product_variants` | Quy cách đóng gói | `packageSize` ("500g"), `weightGrams` (tính giá/kg), `price`, `compareAtPrice` (giá gốc khi giảm), `stockStatus` in_stock/low_stock/out_of_stock, `sku` duy nhất (tuỳ chọn), `isActive` |
| `orders` | Đơn hàng | `orderNumber` duy nhất, thông tin khách, `paymentMethod` cod/bank_transfer, `paymentStatus` unpaid/paid/refunded, `status`, `subtotal`, `shippingFee`, `discount`, `total`, `internalNote` |
| `order_items` | Dòng đơn | `productId`/`variantId` có thể NULL (sản phẩm đã xoá) + bản chụp `productName`, `packageSize`, `unitPrice`, `quantity`, `lineTotal` |
| `order_status_logs` | Lịch sử đơn | `fromStatus` → `toStatus`, `note`, `changedById` |
| `inquiries` | Liên hệ | `type` contact (`wholesale` chỉ còn ở dữ liệu cũ), `status` new/in_progress/done; `company`, `quantity` dùng cho liên hệ sỉ cũ |
| `posts` | Bài viết | `type` knowledge/recruitment, `isPublished`, `publishedAt` (ngày tương lai = hẹn giờ đăng) |
| `banners` | Banner trang chủ / đầu trang Sản phẩm / Tin tức | `placement` home/products/news, `image`, `linkUrl`, `ctaLabel` (chỉ dùng ở trang chủ), `sortOrder`, `isActive` |
| `policies` | Trang chính sách | `slug`, `content`, `sortOrder`, `isActive` |
| `pages` | Trang nội dung cố định | Khoá `slug` (`about`), `title`, `description`, `content` (HTML). Chưa có dòng → API trả nội dung mặc định |
| `site_settings` | Thông tin cửa hàng | Một dòng `id = 1`. Chưa có dòng → API trả `DEFAULT_SITE_SETTINGS` (thông tin thật của cửa hàng trong `packages/types`) |

## 3. Quy tắc toàn vẹn dữ liệu

- **Danh mục → sản phẩm: `Restrict`.** Không xoá được danh mục còn sản phẩm (API trả 409 kèm hướng dẫn).
- **Sản phẩm/quy cách → dòng đơn: `SetNull`.** Xoá sản phẩm không làm mất đơn cũ; đơn vẫn hiển thị đúng nhờ bản chụp.
- **Đơn → dòng đơn, lịch sử: `Cascade`** (đơn hàng không bị xoá qua giao diện).
- **Trạng thái đơn chỉ đi tiến:** `pending → confirmed → (packing) → shipping → delivered`; huỷ được từ mọi trạng thái trước `delivered`. `delivered`/`cancelled` là trạng thái cuối.
- **Tổng tiền:** `total = subtotal + shippingFee − discount`, giảm giá không vượt quá `subtotal + shippingFee`.
- Chỉ có **một** ADMIN: script `create-admin` từ chối tạo ADMIN thứ hai; API quản lý tài khoản chỉ thao tác được trên STAFF.

## 4. Migration

- Thư mục `apps/api/prisma/migrations/` — hiện có một migration khởi tạo `20260929000000_init`.
- Máy dev, sau khi sửa `schema.prisma`: `npm run db:migrate` (tạo migration mới + áp dụng).
- Máy chủ / database mới: `npm run db:deploy` (chỉ áp migration có sẵn, không bao giờ xoá dữ liệu). Image Docker của API tự chạy lệnh này khi khởi động.
- **Không có seed cho production.** Database mới chỉ cần tạo ADMIN: `npm run admin:create`.
- Máy dev / staging: `npm run db:seed:test` xoá sạch rồi nạp bộ dữ liệu kiểm thử ([06-testing/README.md §3](../06-testing/README.md#3-dữ-liệu-chuẩn-bị)). Từ chối chạy khi `NODE_ENV=production` hoặc database không ở máy cục bộ.

## 5. Ảnh

Ảnh không lưu trong database mà trên đĩa của API (`UPLOAD_DIR`, mặc định `apps/api/uploads/yyyy/mm/`). Database chỉ lưu đường dẫn tương đối `/uploads/...`; API ghép `PUBLIC_URL` khi trả ra. Nhờ vậy đổi tên miền không cần sửa dữ liệu. Khi sao lưu phải sao lưu **cả database lẫn thư mục ảnh**.


## 6. Nội dung có định dạng

`posts.content`, `policies.content`, `pages.content`, `products.description` lưu **HTML đã lọc** (xem [api.md §6](api.md#6-nội-dung-có-định-dạng-html)). Dữ liệu cũ dạng chữ thường vẫn hợp lệ — được chuyển sang HTML khi đọc. Ảnh trong bài cũng nằm ở thư mục `uploads/` nên được sao lưu cùng ảnh sản phẩm.
