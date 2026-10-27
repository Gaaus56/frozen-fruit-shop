# API — Audit (`/admin/audit-logs`) — chỉ ADMIN

Lịch sử mọi lần tài khoản quản trị thêm / sửa / xoá dữ liệu.

- **Ghi tự động:** `AuditInterceptor` (đăng ký toàn cục bằng `APP_INTERCEPTOR`) chặn mọi request ghi vào `/admin/*`: đọc bản ghi **trước** khi xử lý, chạy endpoint, đọc lại **sau**, rồi lưu các trường đã đổi. Mục được ghi = đoạn đường dẫn sau `/admin/` (`products`, `orders`, `settings`…), có bảng ánh xạ `find` / `label` cho từng mục để lấy tên dễ đọc (tên sản phẩm, mã đơn, tiêu đề bài…).
- **Không ghi:** tải ảnh (`uploads`); các trường kỹ thuật / nhạy cảm (`id`, mốc thời gian, `passwordHash`, `failedLoginCount`, `lockedUntil`, `lastLoginAt`, và toàn bộ trường OTP). Đặt lại mật khẩu / tắt OTP nhân viên chỉ ghi là đã làm, không ghi giá trị.
- **Rút gọn:** HTML → chữ thường, chuỗi dài cắt 160 ký tự, danh sách con (quy cách, ảnh, dòng đơn) → một dòng chữ.
- Ghi lịch sử lỗi chỉ log, không làm hỏng thao tác của người dùng. Đường `/auth/*` không qua interceptor nên bật / tắt OTP được ghi tay trong `AuthService`.

`GET /admin/audit-logs?userId=&resource=&page=&pageSize=` (mặc định 30 / trang, mới nhất trước) → `Paginated<AuditLogEntry>` với `changes: [{ field, before, after }]`.

**Code**

- `apps/api/src/audit/audit.module.ts` — `diffRows`, `AuditInterceptor`, `AuditController`
- Bảng `audit_logs` (`AuditLog`): lưu `userName` / `userEmail` / `userRole` tại thời điểm làm nên vẫn đọc được khi tài khoản đã bị xoá

Admin: [activity](../admin/activity.md).
