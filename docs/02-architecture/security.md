# Bảo mật

Tài liệu cho người phát triển / vận hành. Mục 5 là danh sách đầy đủ các kỹ thuật bảo mật backend chuyên nghiệp, có đánh dấu dự án đã làm tới đâu.

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
- Admin lưu token trong cookie `admin_token`: `httpOnly`, `SameSite=Lax`, `Secure` khi production — JavaScript trên trình duyệt không đọc được.
- Guard `@Auth()` xác minh chữ ký **và** đọc user từ DB mỗi request: không tồn tại, bị khoá, hoặc token cấp trước `passwordChangedAt` → 401. Quyền nhân viên cũng đọc lại mỗi request (đổi quyền có hiệu lực ngay).
- Sai mật khẩu **hoặc mã OTP** 5 lần liên tiếp → khoá 15 phút. Thông báo lỗi không tiết lộ email có tồn tại hay không (so bcrypt với hash giả khi email không có).
- Chỉ có **một** ADMIN, tạo bằng lệnh trên máy chủ (`npm run admin:create`); không có API tạo ADMIN.

## 3. Xác thực 2 lớp (OTP)

**Kiểu:** TOTP (RFC 6238) — mã 6 số đổi mỗi 30 giây trong app Google Authenticator / Microsoft Authenticator. Miễn phí, không cần dịch vụ gửi SMS / email, không bị chặn sóng hay vào spam. Mọi tài khoản (chủ và nhân viên) tự bật ở **Tài khoản của tôi**; tài khoản chủ chưa bật sẽ thấy dải nhắc ở mọi trang.

### Luồng

| Bước | Endpoint | Ghi chú |
|---|---|---|
| Bật — nhập lại mật khẩu → QR | `POST /auth/otp/setup` | Khoá bí mật lưu tạm (`otpPendingSecret`) tới khi xác nhận |
| Bật — nhập mã trong app | `POST /auth/otp/enable` | Trả **8 mã dự phòng** (hiện một lần) + token mới đã xác thực OTP |
| Đăng nhập bước 1 | `POST /auth/login` | Đã bật OTP → `{ otpRequired, otpToken }` (hết hạn 5 phút), **chưa** phát token |
| Đăng nhập bước 2 | `POST /auth/login/otp` | Mã 6 số hoặc mã dự phòng |
| Xác thực lại cho thao tác nhạy cảm | `POST /auth/otp/step-up` | Token mới mang mốc `otp`, dùng được 10 phút |
| Tắt | `POST /auth/otp/disable` | Cần **cả** mật khẩu và mã |
| Tạo lại mã dự phòng | `POST /auth/otp/recovery-codes` | Mã cũ hết hiệu lực |
| Chủ tắt giúp nhân viên mất điện thoại | `POST /admin/users/:id/reset-otp` | Cần OTP của chủ |
| Chủ mất điện thoại + mất mã dự phòng | `ADMIN_RESET_OTP=1 npm run admin:create` trên máy chủ | Đặt lại mật khẩu + tắt OTP |

### Biện pháp kỹ thuật

- Khoá bí mật TOTP **mã hoá AES-256-GCM** trong DB (`OTP_ENCRYPTION_KEY`, 32 byte) — lộ bản sao database cũng không tự sinh được mã.
- **Chống dùng lại mã:** lưu bước thời gian của mã vừa dùng (`otpLastTimeStep`), mã cùng bước hoặc cũ hơn bị từ chối.
- Chấp nhận lệch đồng hồ điện thoại ±30 giây.
- Mã dự phòng lưu **SHA-256**, so bằng `timingSafeEqual`, dùng xong xoá.
- Token tạm của bước nhập mã (`typ: otp-challenge`) bị guard từ chối nếu đem dùng như token đăng nhập; đổi mật khẩu làm token tạm cũ mất hiệu lực.
- Sai mã OTP tính chung bộ đếm khoá 15 phút với sai mật khẩu; đúng mật khẩu **không** xoá bộ đếm khi còn chờ nhập mã (tránh dò mã bằng cách đăng nhập lại liên tục).
- Bật / tắt OTP, chủ tắt OTP nhân viên đều ghi **Lịch sử chỉnh sửa**; khoá bí mật và mã dự phòng không bao giờ vào lịch sử hay Sentry.

### Thao tác cần nhập lại mã OTP (`@RequireOtp()`)

Đã bật OTP thì phải nhập mã trong 10 phút gần nhất (lúc đăng nhập cũng tính); quá hạn API trả `403 { code: "OTP_REQUIRED" }`, trang quản trị tự hiện hộp nhập mã rồi gửi lại thao tác.

| Thao tác | Vì sao | Trạng thái |
|---|---|:-:|
| Đổi mật khẩu của mình | Kẻ chiếm phiên đổi mật khẩu là khoá chủ thật ra ngoài | ✅ |
| Tắt OTP / tạo lại mã dự phòng | Gỡ lớp bảo vệ thứ 2 | ✅ (nhập mã trong form) |
| Tạo, sửa quyền, khoá / mở, đặt lại mật khẩu, tắt OTP, xoá **tài khoản nhân viên** | Tạo "cửa sau" để quay lại sau | ✅ |
| Sửa **Thông tin cửa hàng** (hotline, Zalo, Facebook, MST) | Đổi số điện thoại là cách lừa khách chuyển tiền / đặt hàng nhanh nhất | ✅ |
| Xuất Excel đơn hàng (tên, SĐT, địa chỉ khách) | Rút dữ liệu khách hàng hàng loạt | 💡 đề xuất |
| Xoá sản phẩm / danh mục / bài viết | Phá dữ liệu khó khôi phục | 💡 đề xuất (đã có hộp xác nhận + lịch sử) |
| Sửa giá hàng loạt, đổi trạng thái đơn đã giao / huỷ đơn giá trị lớn | Gian lận doanh thu | 💡 khi có tính năng sửa hàng loạt |
| Thêm cổng thanh toán / đổi tài khoản nhận tiền (khi có) | Chuyển hướng tiền của khách | 💡 bắt buộc nếu làm |

## 4. Nguy cơ và biện pháp

| Nguy cơ | Biện pháp hiện có |
|---|---|
| Dò mật khẩu admin | bcrypt (12 vòng); khoá 15 phút sau 5 lần sai; 10 lần đăng nhập / phút / IP; **OTP** |
| Lộ mật khẩu (dùng lại mật khẩu ở web khác, bị lừa đảo) | **OTP** — thiếu điện thoại thì không vào được |
| Token bị lộ / nhân viên nghỉ việc | Khoá tài khoản hoặc đổi mật khẩu → mọi token cũ mất hiệu lực ngay |
| Chiếm phiên rồi tạo cửa sau / đổi số điện thoại | Thao tác nhạy cảm cần nhập lại mã OTP (mục 3) |
| XSS lấy token | Token nằm trong cookie httpOnly; nội dung soạn thảo lọc bằng `sanitize-html` (danh sách thẻ / thuộc tính cho phép) |
| Nhân viên xem doanh thu / sửa ngoài quyền | `@Auth('ADMIN')`, `@Permission(...)` kiểm tra ở API cho từng endpoint |
| Sửa giá từ trình duyệt | API tự tính giá; đơn lưu bản chụp giá tại thời điểm đặt |
| Spam đơn / form liên hệ / bình luận | Rate limit theo IP + trường bẫy `website` (honeypot); bình luận chờ duyệt |
| Tải file độc hại | Chỉ JPG/PNG/WEBP/GIF, kiểm tra **magic bytes**, `sharp` giải mã lại + bỏ metadata (EXIF/GPS), tên file ngẫu nhiên |
| Dữ liệu sai định dạng / trường lạ | `ValidationPipe` (whitelist + forbidNonWhitelisted), body JSON ≤ 1 MB |
| SQL injection | Prisma (truy vấn có tham số), không ghép chuỗi SQL |
| Gọi API từ trang lạ | CORS chỉ cho `CORS_ORIGINS` |
| Clickjacking | API `X-Frame-Options: DENY`; web chỉ cho admin nhúng (`frame-ancestors`) |
| Lỗi lộ chi tiết nội bộ | Lỗi Prisma đổi thành thông báo tiếng Việt; lỗi 500 không trả stack; gửi chi tiết về Sentry (đã lọc dữ liệu cá nhân) |
| Truy vết sự cố | **Lịch sử chỉnh sửa** (ai sửa gì, trước → sau) + Sentry |
| Giả mạo lệnh xoá cache web | `/api/revalidate` yêu cầu `x-revalidate-secret` |

## 5. Danh sách kỹ thuật bảo mật backend chuyên nghiệp

✅ đã có · 🟡 có một phần · ❌ chưa có · — không áp dụng

### Xác thực & phiên
| Kỹ thuật | Dự án |
|:--|:-:|
| Băm mật khẩu bằng thuật toán chậm (bcrypt / argon2), không bao giờ lưu mật khẩu gốc | ✅ bcrypt 12 |
| Chính sách mật khẩu (độ dài tối thiểu, chặn mật khẩu phổ biến / đã lộ — Have I Been Pwned) | 🟡 tối thiểu 8 (ADMIN 12) |
| Khoá tạm sau nhiều lần sai, thông báo lỗi không lộ email tồn tại | ✅ |
| Xác thực 2 lớp (TOTP / WebAuthn passkey) + mã dự phòng | ✅ TOTP · ❌ passkey |
| Xác thực lại cho thao tác nhạy cảm (step-up) | ✅ |
| Token ngắn hạn, thu hồi được (đổi mật khẩu / khoá → token cũ chết) | ✅ |
| Cookie phiên `httpOnly` + `Secure` + `SameSite` | ✅ |
| Refresh token xoay vòng, danh sách thiết bị đang đăng nhập, "đăng xuất mọi nơi" | ❌ (đổi mật khẩu = đăng xuất mọi nơi) |
| Thông báo email khi đăng nhập từ thiết bị lạ / đổi mật khẩu / tắt OTP | ❌ cần dịch vụ email |

### Phân quyền
| Kỹ thuật | Dự án |
|:--|:-:|
| Kiểm tra quyền ở server cho **mọi** endpoint (không tin giao diện) | ✅ |
| Nguyên tắc quyền tối thiểu (nhân viên chỉ thấy mục được cấp) | ✅ |
| Chống IDOR (sửa bản ghi người khác bằng cách đổi id) | ✅ tra cứu đơn cần mã đơn + SĐT |
| Tách tài khoản quản trị duy nhất, không tạo được qua API | ✅ |

### Dữ liệu đầu vào / đầu ra
| Kỹ thuật | Dự án |
|:--|:-:|
| Validate mọi input (DTO, whitelist, chặn trường lạ, giới hạn độ dài) | ✅ |
| Truy vấn có tham số (ORM) — chống SQL injection | ✅ |
| Lọc HTML do người dùng nhập (allowlist) — chống XSS | ✅ |
| Giới hạn kích thước body / file | ✅ |
| Upload: kiểm magic bytes, giải mã lại ảnh, bỏ metadata, tên ngẫu nhiên, không cho chạy file | ✅ |
| Lưu file ở kho riêng (S3 / R2) có URL ký, tách khỏi máy chủ API | ❌ (ổ đĩa máy chủ) |
| Không trả lỗi kỹ thuật (stack trace, câu SQL) cho người dùng | ✅ |

### Chống lạm dụng
| Kỹ thuật | Dự án |
|:--|:-:|
| Rate limit theo IP cho đăng nhập, đặt hàng, liên hệ, tra cứu | ✅ (bộ nhớ trong 1 tiến trình) |
| Rate limit dùng chung nhiều máy chủ (Redis) | ❌ cần khi chạy > 1 bản API |
| Honeypot / CAPTCHA (Cloudflare Turnstile) cho form công khai | 🟡 honeypot |
| Chống bot / DDoS ở tầng mạng (Cloudflare) | ❌ |

### Bí mật & cấu hình
| Kỹ thuật | Dự án |
|:--|:-:|
| Bí mật nằm trong biến môi trường, không commit (`.env` trong `.gitignore`) | ✅ |
| Kiểm tra cấu hình lúc khởi động (thiếu / yếu → từ chối chạy) | ✅ JWT_SECRET, OTP key |
| Mã hoá dữ liệu nhạy cảm trong DB (khoá OTP) | ✅ AES-256-GCM |
| Xoay vòng khoá định kỳ, kho bí mật (Vault, Doppler) | ❌ |

### Truyền tải & header
| Kỹ thuật | Dự án |
|:--|:-:|
| HTTPS toàn bộ (HSTS) | ✅ Vercel / Render tự cấp |
| CORS chỉ cho origin của mình | ✅ |
| Header bảo mật (`nosniff`, `X-Frame-Options`, `Referrer-Policy`) | ✅ API · 🟡 web / admin |
| Content-Security-Policy đầy đủ cho web / admin | 🟡 chỉ `frame-ancestors` |

### Giám sát, ghi vết, khôi phục
| Kỹ thuật | Dự án |
|:--|:-:|
| Nhật ký thao tác quản trị (audit log, trước → sau) | ✅ |
| Theo dõi lỗi tập trung, báo ngay khi có lỗi | ✅ Sentry (khi đặt DSN) |
| Không ghi dữ liệu cá nhân / mật khẩu / token vào log | ✅ |
| Theo dõi uptime, báo khi sập | 🟡 UptimeRobot (giữ Render thức) |
| Sao lưu database tự động + **thử khôi phục định kỳ** | 🟡 Neon có khôi phục theo thời điểm (gói free giữ lịch sử ngắn) — chưa có bản sao lưu riêng |

### Chuỗi cung ứng & quy trình
| Kỹ thuật | Dự án |
|:--|:-:|
| Khoá phiên bản thư viện (`package-lock.json`, `npm ci`) | ✅ |
| Quét lỗ hổng thư viện (`npm audit`, Dependabot) trong CI | ❌ |
| Review code trước khi gộp, nhánh chính được bảo vệ | 🟡 |
| Kiểm thử bảo mật (OWASP ZAP, pentest) trước khi chạy thật | ❌ |

### Dữ liệu cá nhân (Nghị định 13/2023 về bảo vệ dữ liệu cá nhân)
| Kỹ thuật | Dự án |
|:--|:-:|
| Chỉ thu thập dữ liệu cần thiết (tên, SĐT, địa chỉ giao hàng) | ✅ |
| Chính sách bảo mật công khai trên web | ✅ trang Chính sách |
| Không lưu thông tin thẻ / tài khoản ngân hàng của khách | ✅ (chỉ COD) |
| Quy trình xoá dữ liệu khách theo yêu cầu, giới hạn thời gian lưu | ❌ |

## 6. Việc nên làm tiếp (theo thứ tự ưu tiên)

| Việc | Lý do | Ưu tiên |
|---|---|:-:|
| Chủ cửa hàng **bật OTP** ngay sau khi nhận bàn giao, lưu mã dự phòng ra giấy | Tính năng có sẵn nhưng phải tự bật | P0 |
| Đặt `OTP_ENCRYPTION_KEY` riêng trên máy chủ (không dùng khoá suy ra từ JWT) | Đổi JWT_SECRET sau này không làm hỏng OTP | P1 |
| Header bảo mật + CSP cho web / admin (`next.config` `headers()`) | Hiện chủ yếu API có header | P1 |
| Cloudflare (DNS + chống bot) và Turnstile cho form liên hệ / đặt hàng khi có tên miền riêng | Spam đơn ảo | P2 |
| Dependabot / `npm audit --audit-level=high` trong CI | Phát hiện thư viện có lỗ hổng | P2 |
| Email cảnh báo khi đăng nhập / đổi mật khẩu / tắt OTP | Chủ biết ngay khi có người lạ vào | P2 (cần dịch vụ email — xem [automation.md](../04-operations/automation.md)) |
| Lưu ảnh lên Cloudflare R2 / S3 | Render free mất ảnh khi khởi động lại; tách file khỏi máy chủ | P2 |
| Rate limit đăng nhập theo **email** (ngoài theo IP) | Đăng nhập admin đi qua server admin nên chung 1 IP | P3 |

Không lưu thông tin thẻ thanh toán. Khi thêm cổng thanh toán online, mọi xử lý thẻ nằm ở bên cổng; API chỉ nhận và **xác minh chữ ký** webhook.
