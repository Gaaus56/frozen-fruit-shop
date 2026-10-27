# Admin — Đăng nhập (`/login`)

1. **Banner trái** — logo tròn + tên cửa hàng (`LogoBadge`).
2. **Thông báo** — "phiên hết hạn" nếu URL có `?expired`; tham số `?bye=1` (vừa đăng xuất) được dọn khỏi thanh địa chỉ.
3. **`LoginForm` — bước 1**: email + mật khẩu, gửi Server Action `loginAction`.
4. **`OtpStep` — bước 2**: chỉ khi tài khoản đã bật OTP. API trả `otpToken` thay vì token, form chuyển sang ô nhập mã 6 số (hoặc **mã dự phòng** dạng `ABCD-EF23`), gửi `loginOtpAction`. Sai mã thì ở lại bước này; phiên nhập mã hết hạn hoặc tài khoản bị khoá tạm thì quay về bước mật khẩu.

Đăng nhập xong có hiệu ứng banner trượt sang trái, form trượt sang phải rồi chuyển vào mục đầu tiên tài khoản được phép (tắt nếu người dùng bật "giảm chuyển động").

Hành vi phía API: sai mật khẩu hoặc mã OTP 5 lần liên tiếp thì khoá tài khoản 15 phút; token hết hạn mặc định sau 12 giờ.

Chi tiết OTP: [api/auth.md](../api/auth.md); bật / tắt OTP ở [account](account.md).

**Code**

- `apps/admin/src/app/login/page.tsx`, `login-form.tsx`, `actions.ts` (`loginAction`, `loginOtpAction`)
- `apps/admin/src/app/logout/route.ts` — xoá cookie rồi về `/login?bye=1`
- `apps/admin/src/lib/session.ts` (`setToken`, `clearToken`)

Đây là trang duy nhất ngoài nhóm `(dashboard)`, dùng `app/layout.tsx` (không có Sidebar).
