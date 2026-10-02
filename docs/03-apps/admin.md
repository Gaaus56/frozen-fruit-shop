# Trang quản trị (`apps/admin`)

Next.js 16 + Tailwind CSS 4, cổng 3002. Cùng tông màu với web khách (đỏ `accent`, xanh lá `leaf`, thanh bên màu mực). Dùng được trên điện thoại (menu trượt, bảng cuộn ngang). Trang chi tiết đơn có nút in.

## 1. Tài khoản và phân quyền

| Vai trò | Số lượng | Tạo bằng | Đăng nhập |
|---|---|---|---|
| **ADMIN** (chủ cửa hàng) | Đúng **1** | Lệnh `npm run admin:create` trên máy chủ (không tạo được qua giao diện/API) | Email + mật khẩu (sau này thêm OTP — xem mục 4) |
| **STAFF** (nhân viên) | Không giới hạn | ADMIN tạo ở trang *Tài khoản nhân viên* | Email + mật khẩu, không cần OTP |

| Chức năng | ADMIN | STAFF |
|---|:-:|:-:|
| Tổng quan bán hàng (doanh thu, biểu đồ, sản phẩm bán chạy...) | ✅ | ❌ |
| Đơn hàng: xem, xác nhận, cập nhật trạng thái/thanh toán/phí ship/giảm giá, ghi chú nội bộ, in | ✅ | ✅ |
| Liên hệ & báo giá sỉ: xem, đổi trạng thái, xoá | ✅ | ✅ |
| Sản phẩm, danh mục, ảnh | ✅ | ✅ |
| Banner, bài viết, chính sách | ✅ | ✅ |
| Thông tin cửa hàng (hotline, địa chỉ, chuyển khoản...) | ✅ | ❌ |
| Tài khoản nhân viên (tạo, khoá/mở, đặt lại mật khẩu, xoá) | ✅ | ❌ |
| Đổi mật khẩu của chính mình | ✅ | ✅ |

Phân quyền được kiểm tra ở **API** (`@Auth('ADMIN')`) — đây là lớp bảo vệ thật. Giao diện admin chỉ ẩn menu và chuyển hướng (`requireAdmin()` → `/orders?forbidden=1`) để trải nghiệm rõ ràng.

Quy tắc phiên đăng nhập:
- Token JWT hạn `JWT_EXPIRES_IN` (mặc định 12 giờ), lưu trong cookie httpOnly `admin_token`.
- Khoá tài khoản nhân viên hoặc đặt lại mật khẩu → nhân viên bị đăng xuất ngay ở mọi thiết bị.
- Tự đổi mật khẩu → các thiết bị khác bị đăng xuất, thiết bị hiện tại nhận token mới.
- Sai mật khẩu 5 lần → tài khoản bị khoá 15 phút.

## 2. Các trang

| Trang | Nội dung |
|---|---|
| `/login` | Đăng nhập. ADMIN vào `/`, STAFF vào `/orders` |
| `/` (ADMIN) | Chọn khoảng 7 / 30 / 90 / 365 ngày. Doanh thu, số đơn, giá trị TB/đơn, tỷ lệ huỷ (so với kỳ trước); biểu đồ doanh thu theo ngày/tháng; sản phẩm bán chạy; doanh thu theo danh mục; đơn theo trạng thái; theo phương thức thanh toán; đơn gần đây; kho (quy cách sắp hết/hết hàng). Doanh thu không tính đơn huỷ, tính theo giờ Việt Nam |
| `/orders` | Lọc theo trạng thái, tìm theo mã đơn/tên/SĐT, phân trang |
| `/orders/[id]` | Chi tiết đơn, chuyển trạng thái hợp lệ, trạng thái thanh toán, phí vận chuyển, giảm giá, ghi chú nội bộ, lịch sử thay đổi (ai, lúc nào), in phiếu |
| `/inquiries` | Liên hệ và yêu cầu báo giá sỉ; trạng thái Mới / Đang xử lý / Xong |
| `/products` | Lọc theo tên, danh mục, trạng thái; bật/tắt bán nhanh; cảnh báo hết hàng, chưa có ảnh |
| `/products/new`, `/products/[id]` | Tên, mô tả, **nhiều ảnh** (kéo thứ tự, ảnh đầu là ảnh chính, tối đa 12), **quy cách đóng gói** (quy cách, khối lượng, giá bán, giá gốc, tồn kho, SKU, đang bán; hiện giá/kg), bảo quản & rã đông, danh mục, nổi bật, nhận sỉ, thứ tự, slug |
| `/categories` | Danh mục kèm ảnh, mô tả, thứ tự, ẩn/hiện. Không xoá được danh mục còn sản phẩm |
| `/banners` | Banner trang chủ (ảnh 21:8, tiêu đề, mô tả, liên kết, chữ trên nút, thứ tự) |
| `/posts` | Bài viết: ảnh bìa, chuyên mục, tóm tắt, nội dung, bản nháp / hẹn giờ đăng |
| `/policies` | Trang chính sách. Có **mẫu soạn sẵn** "Chính sách bảo hành & đổi trả" lấy từ tài liệu cửa hàng |
| `/settings` (ADMIN) | Tên cửa hàng, hotline, giờ nghe máy, Zalo, email, Facebook, địa chỉ, link bản đồ, thông tin chuyển khoản, MST, dòng chữ chạy |
| `/users` (ADMIN) | Danh sách tài khoản, tạo nhân viên, đặt lại mật khẩu, khoá/mở khoá, xoá |
| `/account` | Thông tin tài khoản, đổi mật khẩu |

Mọi thay đổi nội dung được API báo sang web để làm mới ngay (không phải chờ 5 phút).

## 3. Kỹ thuật

- **Không có API route riêng**: trang là Server Component gọi `api<T>()` (`src/lib/api.ts`, chỉ chạy phía server) kèm token từ cookie; thao tác ghi là **Server Action** (`actions.ts` cạnh mỗi trang) bọc bởi `runAction()` để trả lỗi hiển thị trên form.
- API trả 401 → chuyển tới `/logout?expired=1` (route xoá cookie rồi về `/login`), tránh vòng lặp chuyển hướng.
- `src/proxy.ts` (middleware của Next 16) chặn mọi trang khi chưa có cookie, trừ `/login`, `/logout`, `/api/*` (route tự kiểm tra phiên).
- **Realtime**: `components/layout/live-updates.tsx` (gắn trong layout dashboard) mở `EventSource("/api/events")`. Route `app/api/events/route.ts` gắn token từ cookie rồi chuyển tiếp luồng `GET /admin/events` của API. Mỗi sự kiện → `router.refresh()` (số việc trên menu và trang đang xem cập nhật, form đang nhập giữ nguyên); đơn hàng / liên hệ mới → thông báo góc màn hình + âm báo. Chi tiết: [request-flows.md](../02-architecture/request-flows.md#5-cập-nhật-realtime).
- Tải ảnh: `ImageUpload` (1 ảnh) / `ImageListUpload` (nhiều ảnh) gọi Server Action `uploadImageAction` → `POST /admin/uploads`. Giới hạn body Server Action 6 MB (`next.config.ts`).
- Thành phần giao diện dùng chung ở `src/components/ui/` (Button, SubmitButton, Field, Section, Table, Badge, DeleteButton, Pagination, ImageUpload).

Biến môi trường (`apps/admin/.env.local`): `API_URL` — địa chỉ API mà server admin gọi (mặc định `http://localhost:4000`).

## 4. Kế hoạch xác thực OTP cho ADMIN

Hiện ADMIN đăng nhập bằng email + mật khẩu. Thiết kế đã chừa chỗ để thêm OTP mà không đổi luồng của nhân viên:

1. `POST /auth/login`: nếu tài khoản là ADMIN và mật khẩu đúng → không trả token ngay mà trả `{ otpRequired: true, challengeId }`, đồng thời gửi mã 6 số qua email (hoặc dùng ứng dụng TOTP như Google Authenticator).
2. Thêm `POST /auth/verify-otp { challengeId, code }` → kiểm tra mã (hết hạn 5 phút, tối đa 5 lần thử) → trả token như hiện nay.
3. Database: thêm bảng `otp_challenges` (userId, codeHash, expiresAt, attempts) hoặc cột `totpSecret` trên `users`.
4. Admin: sau bước mật khẩu, trang `/login` hiện ô nhập mã OTP; phần còn lại (cookie, phiên) giữ nguyên.
5. STAFF không bị ảnh hưởng: API chỉ yêu cầu OTP khi `role === 'ADMIN'`.

Điểm chèn trong mã: `AuthService.login()` ở `apps/api/src/auth/auth.service.ts` (đã có ghi chú).
