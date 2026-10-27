# API — Users (`/admin/users`) — chỉ ADMIN

Quản lý tài khoản **nhân viên** (STAFF). API này không bao giờ tạo hay sửa tài khoản ADMIN — ADMIN duy nhất chỉ được tạo bằng lệnh `npm run admin:create` trên máy chủ.

| Method & đường dẫn | Mô tả |
|---|---|
| `GET /admin/users` | Danh sách tài khoản (`StaffAccount`) |
| `POST /admin/users` | Tạo nhân viên: email, họ tên, mật khẩu (≥ `PASSWORD_MIN_LENGTH`), `permissions[]` (bỏ trống = chưa cấp quyền nào) |
| `PATCH /admin/users/:id` | Sửa tên, khoá / mở khoá (`isActive`), `permissions[]` |
| `POST /admin/users/:id/reset-password` | Đặt mật khẩu mới; nhân viên bị đăng xuất khỏi mọi thiết bị |
| `POST /admin/users/:id/reset-otp` | Tắt OTP giúp nhân viên mất điện thoại; nhân viên đăng nhập lại bằng mật khẩu rồi tự bật lại |
| `DELETE /admin/users/:id` | Xoá nhân viên (lịch sử vẫn giữ tên ở `AuditLog.userName`) |

Mọi thao tác ghi đều gắn `@RequireOtp()` — cần nhập mã OTP gần đây nếu chủ cửa hàng đã bật OTP.

Quyền hợp lệ: `orders`, `inquiries`, `products`, `categories`, `banners`, `homeBlocks`, `posts`, `comments`, `pages`, `policies` (`STAFF_PERMISSIONS` trong `packages/types`).

**Code**

- `apps/api/src/users/users.controller.ts`, `users.service.ts`, `users.dto.ts`, `users.module.ts`

Admin: [users](../admin/users.md).
