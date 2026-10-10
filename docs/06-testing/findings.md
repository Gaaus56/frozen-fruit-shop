# Phát hiện khi viết kịch bản test

Ghi lại các lỗi và điểm lệch thấy được khi **đọc code** để viết kịch bản (chưa chạy thử). Mỗi mục có ca test để xác nhận. Xử lý xong thì ghi ✅ và commit sửa lỗi vào cột "Trạng thái".

Mức độ: **Cao** ảnh hưởng dữ liệu / trải nghiệm chính · **Vừa** gây khó chịu, có cách khắc phục · **Thấp** hiển thị, trường hợp hiếm.

| ID | Mức độ | Vấn đề | Ca test | Trạng thái |
|---|:-:|---|---|---|
| F-01 | Vừa | Một số lỗi validate trả về **tiếng Anh** | TC-API-009, 069, 116 | Mở |
| F-02 | Cao* | Form admin có thể **mất dữ liệu đã nhập** khi API báo lỗi | TC-ADM-195 | Cần xác nhận |
| F-03 | Vừa | `/cart` không báo giá lại; tài liệu nói có | TC-WEB-221 | Mở |
| F-04 | Thấp | Bấm − ở số lượng 1 xoá dòng ngay, không hỏi | TC-WEB-215 | Mở |
| F-05 | Vừa | Quy cách bị xoá → dòng tự biến khỏi giỏ, khách không được báo | TC-WEB-246 | Mở |
| F-06 | Thấp | Gợi ý "Chữ trên nút — để trống sẽ không hiện nút" sai với web | TC-WEB-107 | ✅ Đã sửa gợi ý thành «Để trống sẽ hiện «Xem ngay»» |
| F-07 | Thấp | "Ghi chú cho lần cập nhật" bị bỏ khi không đổi trạng thái | TC-ADM-128 | Mở |
| F-08 | Thấp | STAFF mở `/login` khi đã đăng nhập bị đưa tới thông báo "không truy cập được" | TC-ADM-016 | Mở |
| F-09 | Thấp | Tên chỉ gồm ký hiệu sinh slug rỗng; tìm kiếm ký hiệu ra toàn bộ sản phẩm | TC-ADM-196, TC-WEB-031 | Mở |

\* Mức độ nếu xác nhận đúng.

---

### F-01 — Lỗi validate tiếng Anh
- **Hiện tượng:** các ràng buộc khai báo không kèm `message` (`@MaxLength`, `@Max`, `@IsIn`, `@ArrayMaxSize`, `forbidNonWhitelisted`…) trả thông báo mặc định của class-validator, ví dụ `customerNote must be shorter than or equal to 1000 characters`. Web và admin hiện thẳng thông báo này cho người dùng.
- **Ở đâu:** các DTO trong `apps/api/src/**` (ví dụ `orders/orders.dto.ts`, `inquiries/inquiries.module.ts`, `products/products.dto.ts`).
- **Ảnh hưởng thực tế:** thấp với form web vì ô nhập đã có `maxLength`; cao hơn ở admin (giá, phí ship vượt giới hạn) và khi gọi API trực tiếp. [api.md](../03-apps/api.md) đang ghi "message bằng tiếng Việt".
- **Hướng sửa:** thêm `message` tiếng Việt cho mọi decorator, hoặc dùng `exceptionFactory` trong `ValidationPipe` để dịch theo tên ràng buộc.

### F-02 — Form admin có thể mất dữ liệu khi lỗi (cần xác nhận)
- **Nghi vấn:** admin dùng `<form action={formAction}>` với `useActionState` (React 19.2). Server Action bọc bởi `runAction()` **trả về** `{ error }` thay vì ném lỗi, nên với React đây là action "thành công" — React 19 tự **reset các ô không kiểm soát** (uncontrolled) về `defaultValue` sau action thành công.
- **Hệ quả nếu đúng:** tạo sản phẩm mới, API báo "slug đã được dùng" → tên, mô tả, thông tin bảo quản bị xoá trắng; sửa sản phẩm → các ô quay về giá trị cũ, mất phần vừa sửa. Ảnh và quy cách (state React + input ẩn) không bị ảnh hưởng.
- **Xác nhận:** chạy TC-ADM-195; thử thêm ở form danh mục, banner, bài viết, cài đặt, đổi mật khẩu.
- **Hướng sửa:** trả lại dữ liệu đã gửi trong `ActionState` và dùng làm `defaultValue`, hoặc chặn reset (`onSubmit` + `startTransition` gọi action thủ công).

### F-03 — Trang giỏ hàng không báo giá lại
- **Hiện tượng:** `/cart` hiển thị giá lưu trong `localStorage` lúc thêm vào giỏ. Chỉ `/checkout` mới gọi `POST /orders/quote`. Khách có thể thấy giá cũ / không biết hàng đã hết cho tới khi bấm "Tiến hành thanh toán".
- **Tài liệu lệch:** [web.md](../03-apps/web.md) ghi `/cart` "giá được API kiểm tra lại" và [request-flows.md](../02-architecture/request-flows.md) mô tả báo giá ở bước giỏ hàng.
- **Hướng sửa:** gọi `quoteCart()` ở `/cart` giống checkout (tách thành hook dùng chung), hoặc sửa tài liệu cho đúng hành vi.
- **Đánh giá:** không ảnh hưởng tiền — đơn luôn được tính lại ở API.

### F-04 — Nút − xoá dòng không hỏi
- **Hiện tượng:** ở `/cart`, số lượng 1 bấm − gọi `updateQuantity(…, 0)` → dòng bị xoá ngay. Trang chi tiết sản phẩm thì khoá nút − ở 1, nên hai nơi hành xử khác nhau.
- **Hướng sửa:** khoá nút − ở 1 (đã có nút "Xóa" riêng), hoặc hỏi xác nhận.

### F-05 — Dòng giỏ biến mất không báo
- **Hiện tượng:** API bỏ qua quy cách không còn tồn tại khi báo giá; `applyQuote()` ở web xoá dòng không có trong kết quả. Khách thấy giỏ ít đi mà không biết lý do.
- **Hướng sửa:** trả dòng đó trong báo giá với `issue: "Sản phẩm không còn tồn tại"` thay vì `continue`, để giao diện hiện như dòng hết hàng.

### F-06 — Gợi ý "Chữ trên nút" sai
- **Hiện tượng:** form banner ghi "Để trống sẽ không hiện nút", nhưng `banner-slider.tsx` hiện nút "Xem ngay" khi có liên kết mà chữ trên nút trống.
- **Hướng sửa:** chọn một hành vi và cho gợi ý khớp (đề xuất giữ "Xem ngay", sửa gợi ý thành "Để trống sẽ hiện «Xem ngay»").

### F-07 — Ghi chú cập nhật đơn bị bỏ
- **Hiện tượng:** ô "Ghi chú cho lần cập nhật" chỉ được lưu khi đổi trạng thái. Nhân viên nhập ghi chú (ví dụ mã vận đơn) rồi chỉ bấm "Lưu thay đổi" → ghi chú mất, không báo.
- **Hướng sửa:** khi không đổi trạng thái thì nối ghi chú vào "Ghi chú nội bộ", hoặc ghi một dòng lịch sử không đổi trạng thái, hoặc khoá ô khi chưa chọn trạng thái mới.

### F-08 — STAFF mở `/login`
- **Hiện tượng:** `proxy.ts` chuyển mọi người đã có cookie từ `/login` về `/`; STAFF bị `requireAdmin()` chuyển tiếp sang `/orders?forbidden=1` và thấy thông báo "không truy cập được trang vừa chọn" dù không làm gì sai.
- **Hướng sửa:** chuyển `/login` → `/orders` (trang mọi vai trò đều vào được), để trang `/` tự đưa ADMIN về Tổng quan.

### F-09 — Slug rỗng và tìm kiếm ký hiệu
- **Hiện tượng:** `slugify("!!!")` = `""`. Tạo sản phẩm / danh mục / bài viết có tên chỉ gồm ký hiệu và để trống slug → lưu slug rỗng, trang chi tiết không truy cập được; bản ghi thứ hai như vậy bị lỗi trùng slug. Tìm kiếm "!!!" hoặc "?" trên web: điều kiện `slug contains ""` khớp **mọi** sản phẩm.
- **Hướng sửa:** khi slug sinh ra rỗng thì báo lỗi "Vui lòng nhập đường dẫn"; trong `searchWhere()` bỏ điều kiện slug khi `slugify(term)` rỗng.

---

## Ghi chú khác (không phải lỗi, cần biết khi test)

- Giới hạn tần suất đặt hàng, liên hệ, đăng nhập tính theo IP và nằm trong bộ nhớ: khởi động lại API sẽ xoá bộ đếm. Form liên hệ và form báo giá sỉ dùng chung bộ đếm.
- Đăng nhập admin luôn đi qua server admin nên mọi nhân viên chung một IP với API: 10 lần đăng nhập/phút là giới hạn cho **cả cửa hàng** ([security.md §4](../02-architecture/security.md#4-còn-thiếu-theo-thứ-tự-ưu-tiên)).
- Khi gọi API trực tiếp (không qua Caddy), có thể giả `X-Forwarded-For` để né rate limit. Production không mở API trực tiếp ra Internet nên không ảnh hưởng — nhưng đừng mở cổng 4000 trên VPS.
- Giá gốc nhỏ hơn hoặc bằng giá bán bị API bỏ đi khi lưu (thiết kế), admin không được báo.
