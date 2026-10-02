# Bảo mật

## 1. Mô hình tin cậy

| Vùng | Tin cậy? | Hệ quả |
|---|---|---|
| Trình duyệt khách | ❌ Không | Giá, tồn kho, tổng tiền luôn được API tính lại |
| Trình duyệt admin | ❌ Không | Không giữ token; chỉ ẩn menu cho dễ dùng, quyền thật kiểm tra ở API |
| Server `apps/web`, `apps/admin` | 🟡 Một phần | Chỉ gọi API; không chạm database |
| `apps/api` | ✅ | Điểm kiểm soát duy nhất: validate, xác thực, phân quyền |
| PostgreSQL, thư mục ảnh | ✅ | Chỉ API truy cập, không mở cổng ra Internet |

## 2. Xác thực và phiên

- `POST /auth/login` → JWT (`sub`, `role`), ký bằng `JWT_SECRET` (≥ 32 ký tự ở production, API từ chối khởi động nếu thiếu), hạn `JWT_EXPIRES_IN` (mặc định 12 giờ).
- Admin lưu token trong cookie `admin_token`: `httpOnly`, `SameSite=Lax`, `Secure` khi production.
- Guard `@Auth()` / `@Auth('ADMIN')` xác minh chữ ký **và** đọc user từ DB mỗi request: không tồn tại, `isActive = false`, hoặc token cấp trước `passwordChangedAt` → 401.
- Sai mật khẩu 5 lần → khoá 15 phút. Thông báo lỗi không tiết lộ email có tồn tại hay không.
- Chỉ có **một** ADMIN, tạo bằng lệnh trên máy chủ; không có API tạo ADMIN.

## 3. Nguy cơ và biện pháp

| Nguy cơ | Biện pháp hiện có |
|---|---|
| Dò mật khẩu admin | Khoá 15 phút sau 5 lần sai; 10 lần đăng nhập / phút / IP; bcrypt |
| Token bị lộ / nhân viên nghỉ việc | Khoá tài khoản hoặc đổi mật khẩu → mọi token cũ mất hiệu lực ngay |
| XSS lấy token | Token nằm trong cookie httpOnly, không có trong JavaScript |
| Nhân viên xem doanh thu | `@Auth('ADMIN')` cho thống kê, cài đặt, tài khoản |
| Sửa giá từ trình duyệt | API tự tính giá; đơn lưu bản chụp giá tại thời điểm đặt |
| Spam đơn / form liên hệ | Rate limit theo IP + trường bẫy `website` (honeypot) |
| Tải file độc hại | Chỉ JPG/PNG/WEBP/GIF, ≤ 5 MB, kiểm tra magic bytes, tên file ngẫu nhiên, không liệt kê thư mục |
| Dữ liệu sai định dạng / trường lạ | `ValidationPipe` (whitelist + forbidNonWhitelisted), body JSON ≤ 1 MB |
| Gọi API từ trang lạ | CORS chỉ cho `CORS_ORIGINS` |
| Clickjacking, MIME sniffing (API) | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` |
| Truy cập trực tiếp database | Postgres chỉ ở mạng nội bộ Docker; tường lửa VPS chỉ mở 22, 80, 443 |
| Giả mạo lệnh xoá cache web | `/api/revalidate` yêu cầu `x-revalidate-secret` |

## 4. Còn thiếu (theo thứ tự ưu tiên)

| Việc | Lý do | Ưu tiên |
|---|---|:-:|
| OTP cho ADMIN | Mật khẩu chủ shop lộ = mất toàn quyền ([thiết kế](../03-apps/admin.md#4-kế-hoạch-xác-thực-otp-cho-admin)) | P1 |
| Header bảo mật cho `apps/web` và `apps/admin` (HSTS, `X-Frame-Options`, CSP cơ bản) — thêm ở Caddyfile | Hiện chỉ API có header | P1 |
| SSH chỉ dùng khoá, tắt đăng nhập mật khẩu; `fail2ban` | VPS mở cổng 22 ra Internet | P1 |
| Dependabot / `npm audit` trong CI | Phát hiện thư viện có lỗ hổng | P2 |
| Rate limit đăng nhập theo **email** (ngoài theo IP) | Đăng nhập admin đi qua server admin nên chung 1 IP | P2 |
| Nhật ký thao tác admin (audit log) | Truy vết ai sửa giá / xoá sản phẩm | P3 |

Không lưu thông tin thẻ thanh toán. Khi thêm cổng thanh toán online, mọi xử lý thẻ nằm ở bên cổng; API chỉ nhận và **xác minh chữ ký** webhook.
