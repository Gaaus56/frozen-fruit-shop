# API — Auth (`/auth`)

Đăng nhập bằng email + mật khẩu, phát JWT. Mỗi request vào `/admin/*` đều được `AuthGuard` kiểm tra lại trong DB.

## Endpoint

| Method & đường dẫn | Mô tả | Ghi chú |
|---|---|---|
| `POST /auth/login` | Bước 1: email + mật khẩu | `@RateLimit(10, 60)`. Tài khoản đã bật OTP → trả `{ otpRequired, otpToken }` thay vì token |
| `POST /auth/login/otp` | Bước 2: mã 6 số (hoặc mã dự phòng) + `otpToken` | `@RateLimit(10, 60)` |
| `GET /auth/me` | Thông tin người đang đăng nhập + quyền | `@Auth()` |
| `POST /auth/change-password` | Đổi mật khẩu của chính mình | `@Auth()` `@RequireOtp()`; phiên cũ bị đăng xuất, trả token mới |
| `GET /auth/otp` | Trạng thái OTP của tôi | |
| `POST /auth/otp/setup` | Bật OTP bước 1: nhập lại mật khẩu → khoá mới (chờ xác nhận) + mã QR | |
| `POST /auth/otp/enable` | Bật OTP bước 2: nhập đúng mã → bật, trả 8 mã dự phòng + token mới | |
| `POST /auth/otp/disable` | Tắt OTP: cần mật khẩu + mã OTP / mã dự phòng | `204` |
| `POST /auth/otp/recovery-codes` | Tạo lại 8 mã dự phòng (mã cũ hết hiệu lực) | |
| `POST /auth/otp/step-up` | Nhập lại mã cho thao tác nhạy cảm → token mới dùng được `OTP_STEP_UP_MINUTES` (10) phút | |

## Quy tắc

- **Khoá tài khoản:** sai mật khẩu hoặc mã OTP 5 lần liên tiếp → khoá 15 phút. Đúng mật khẩu nhưng sai OTP vẫn bị tính, tránh dò mã.
- **Không lộ email:** email không tồn tại vẫn so sánh với một hash giả để thời gian phản hồi như nhau.
- **Hiệu lực tức thì:** `AuthGuard` đọc lại user, `isActive`, `permissions`, `passwordChangedAt` ở mỗi request → khoá tài khoản / đổi mật khẩu / bỏ quyền có hiệu lực ngay.
- **OTP (TOTP, app Google / Microsoft Authenticator):**
  - khoá bí mật lưu trong DB đã mã hoá AES-256-GCM bằng `OTP_ENCRYPTION_KEY` (mặc định suy ra từ `JWT_SECRET` — production nên đặt riêng);
  - chấp nhận lệch đồng hồ ±30 giây; chặn dùng lại cùng một mã (`otpLastTimeStep`);
  - 8 mã dự phòng, mỗi mã dùng một lần;
  - bật / tắt OTP được ghi tay vào Lịch sử chỉnh sửa (đường `/auth/*` không đi qua bộ ghi tự động);
  - thao tác đánh dấu `@RequireOtp()` (đổi mật khẩu, sửa Thông tin cửa hàng, quản lý nhân viên) trả `403 { code: "OTP_REQUIRED" }` nếu chưa nhập mã trong 10 phút gần nhất. Tài khoản chưa bật OTP không bị chặn.

- **Nơi đang áp `@RequireOtp()`:** đổi mật khẩu, `PUT /admin/settings`, mọi thao tác ghi tài khoản nhân viên (`/admin/users`). Xuất Excel và xoá sản phẩm / bài viết chưa áp.
- **Mất cả điện thoại lẫn mã dự phòng (ADMIN):** chạy `ADMIN_RESET_OTP=1 npm run admin:create` trên máy chủ — đặt lại mật khẩu, xoá khoá OTP + mã dự phòng, đăng nhập rồi bật lại. Nhân viên mất điện thoại thì ADMIN bấm "Tắt OTP" (`POST /admin/users/:id/reset-otp`).
- **Production:** đặt `OTP_ENCRYPTION_KEY` riêng (`openssl rand -base64 32`) và **không đổi** sau khi đã có người bật OTP, nếu không mọi OTP mất hiệu lực.

Phía admin: bước nhập mã ở `LoginForm`, khối bật / tắt OTP ở `/account`, hộp `OtpStepUpDialog` tự mở khi một thao tác nhận `OTP_REQUIRED` (xem [admin/shared.md](../admin/shared.md)). Layout hiện banner nhắc khi tài khoản ADMIN chưa bật OTP.

## Code

- `apps/api/src/auth/auth.controller.ts`, `auth.service.ts`, `auth.dto.ts`, `auth.module.ts`
- `apps/api/src/auth/auth.guard.ts` — `AuthGuard`, `@Auth`, `@Permission`, `@RequireOtp`, `@CurrentUser`, `effectivePermissions`
- `apps/api/src/auth/otp.ts` — mã hoá khoá, sinh / kiểm tra mã, mã dự phòng, mã QR
- `apps/api/prisma/create-admin.ts` — tạo / đặt lại tài khoản ADMIN duy nhất (`npm run admin:create`; thêm `ADMIN_RESET_OTP=1` để tắt OTP)

Admin: [login](../admin/login.md), [account](../admin/account.md), [users](../admin/users.md).
