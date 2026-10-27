# API — Prisma / Database

1. **`PrismaService`** — client Prisma dùng chung qua DI (`@Global` `PrismaModule`), có hook đóng kết nối khi tắt app.
2. **`schema.prisma`** — nguồn sự thật của cấu trúc bảng. Quy ước: bảng snake_case số nhiều (`@@map`), tiền kiểu `Int` (đồng), ảnh lưu đường dẫn tương đối `/uploads/...`.
3. **Migration** — mỗi thay đổi schema là một thư mục trong `migrations/`; chạy bằng `npm run db:migrate` (dev) hoặc `npm run db:deploy` (áp migration có sẵn, dùng khi triển khai).
4. **Script**:
   - `create-admin.ts` — tạo hoặc đặt lại mật khẩu tài khoản ADMIN duy nhất (`npm run admin:create`), không tạo được qua giao diện; thêm `ADMIN_RESET_OTP=1` để tắt OTP của ADMIN;
   - `seed-test.ts` — nạp dữ liệu mẫu cho máy dev (`npm run db:seed:test`, **xoá sạch DB** rồi nạp lại; ảnh mẫu ở `prisma/seed-assets`);
   - `reset-clean.ts` — xoá dữ liệu về trạng thái rỗng (`npm run db:reset:clean`).

## Các nhóm bảng

| Nhóm | Model |
|---|---|
| Tài khoản | `User` (vai trò, `permissions[]`, khoá đăng nhập, các trường OTP), `AuditLog` |
| Sản phẩm | `Category`, `Product`, `ProductImage`, `ProductVariant` |
| Đơn hàng | `Order`, `OrderItem` (snapshot tên / giá), `OrderStatusLog` |
| Liên hệ | `Inquiry` |
| Nội dung | `Post`, `Comment`, `Banner`, `Policy`, `Page`, `HomeBlock`, `SiteSetting` |

Enum: `Role`, `StockStatus`, `OrderStatus`, `PaymentMethod` (chỉ `cod`), `PaymentStatus`, `InquiryType`, `InquiryStatus`, `PostType`, `BannerPlacement`, `HomeBlockPosition`, `CommentStatus`.

**Code**

- `apps/api/src/prisma/prisma.service.ts`, `prisma.module.ts`
- `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/`
- `apps/api/prisma/create-admin.ts`, `seed-test.ts`, `reset-clean.ts`

Tài liệu bảng chi tiết hơn: [docs/03-apps/database.md](../../03-apps/database.md).
