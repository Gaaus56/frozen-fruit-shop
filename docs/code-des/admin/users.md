# Admin — Tài khoản nhân viên (`/users`) — chỉ ADMIN

Mỗi nhân viên chỉ thấy và dùng được các mục được cấp quyền. Tổng quan doanh thu, Thông tin cửa hàng và trang này luôn chỉ dành cho chủ cửa hàng.

1. **`Table`** danh sách tài khoản — cột *Tài khoản* (tên + email), *Vai trò* (`Badge` Quản trị / Nhân viên, thêm "Đã khoá" và "OTP" nếu đang bật), *Quyền* (`Badge` từng quyền), *Đăng nhập gần nhất*. Với STAFF có:
   - **`EditPermissionsForm`** ("Phân quyền") — bảng tick quyền, có nhóm quyền hay dùng để tick nhanh và nút chọn tất cả;
   - **`ResetPasswordForm`** — đặt mật khẩu mới (nhân viên bị đăng xuất khỏi mọi thiết bị);
   - **`ToggleActiveButton`** — khoá / mở khoá;
   - **`ResetStaffOtpButton`** ("Tắt OTP") — tắt xác thực 2 lớp giúp nhân viên mất điện thoại (có xác nhận trước);
   - `DeleteButton`.
2. **`CreateStaffForm`** (cột phải, "Thêm nhân viên") — họ tên, email đăng nhập, mật khẩu (tối thiểu `PASSWORD_MIN_LENGTH` ký tự) và bảng tick quyền.

Quy tắc: không tạo / sửa được tài khoản ADMIN qua giao diện; ADMIN duy nhất tạo bằng lệnh `npm run admin:create` trên máy chủ. Các thao tác ghi đều cần nhập mã OTP nếu chủ cửa hàng đã bật OTP (`withOtpRetry` mở hộp nhập mã rồi tự gửi lại).

**Code**

- `apps/admin/src/app/(dashboard)/users/page.tsx` — gọi `api<StaffAccount[]>("/admin/users")`, `requireAdmin()`
- `users/staff-forms.tsx` (`PermissionPicker`, `EditPermissionsForm`, `CreateStaffForm`, `ToggleActiveButton`, `ResetPasswordForm`, `ResetStaffOtpButton`), `users/actions.ts`
- `packages/types`: `STAFF_PERMISSIONS`, `STAFF_PERMISSION_LABELS`

API: [users](../api/users.md).
