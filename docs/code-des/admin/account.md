# Admin — Tài khoản của tôi (`/account`)

Mở được với mọi tài khoản đã đăng nhập (không cần quyền riêng).

1. **"Thông tin"** — họ tên, email, vai trò (chỉ đọc; nhân viên muốn đổi phải nhờ ADMIN); với STAFF có thêm danh sách quyền được cấp (`Badge`).
2. **"Đổi mật khẩu"** — `ChangePasswordForm`: mật khẩu hiện tại + mật khẩu mới. Đổi xong các phiên cũ (thiết bị khác) bị đăng xuất.
3. **"Xác thực 2 lớp (OTP)"** — `OtpSection` (neo `#otp`), dùng app Authenticator (Google / Microsoft):
   - **Đang tắt → bật**: *Bước 1/2* nhập lại mật khẩu → hiện mã QR; *Bước 2/2* quét QR rồi nhập mã 6 số → bật, hiện **8 mã dự phòng đúng một lần** (cần lưu lại).
   - **Đang bật**: tạo lại 8 mã dự phòng (cần mã OTP; mã cũ hết hiệu lực) hoặc tắt OTP (cần mật khẩu + mã OTP / mã dự phòng).
4. **Nút Đăng xuất** — đặt ở đây (không ở menu) để tránh bấm nhầm.

**Code**

- `apps/admin/src/app/(dashboard)/account/page.tsx` — gọi `getCurrentUser()`
- `account/change-password-form.tsx`, `account/otp-section.tsx`, `account/actions.ts`
- `lib/otp-actions.ts` (`otpSetupAction`, `otpEnableAction`, `otpDisableAction`, `otpRecoveryCodesAction`, `otpStepUpAction`)
- `components/layout/logout-button.tsx`

API: [auth](../api/auth.md).
