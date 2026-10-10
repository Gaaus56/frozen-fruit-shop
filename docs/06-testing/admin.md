# Kịch bản test — Trang quản trị (`apps/admin`)

Mở `http://localhost:3002`. Tài khoản và dữ liệu mẫu: [README.md §3](README.md#3-dữ-liệu-chuẩn-bị). Mỗi thao tác ghi dữ liệu hiển thị trên web → kiểm tra luôn web (mở sẵn một tab `http://localhost:3000`).

Cột **Ưu tiên**: P0 chặn phát hành · P1 chính · P2 phụ. Cột **KQ**: ✅ / ❌ / ⏭.

---

## 1. Đăng nhập, phiên, đăng xuất

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-001 | Chưa đăng nhập | Mở `/`, `/orders`, `/products/new` | Chuyển về `/login` | P0 | |
| TC-ADM-002 | ADMIN đăng nhập | `admin@test.vn` / mật khẩu đúng | Nút "Đang đăng nhập..."; vào `/` (Tổng quan) | P0 | |
| TC-ADM-003 | STAFF đăng nhập | `staff1@test.vn` | Vào `/orders` | P0 | |
| TC-ADM-004 | Email viết hoa, có khoảng trắng | `  ADMIN@TEST.VN ` | Đăng nhập được | P2 | |
| TC-ADM-005 | Bỏ trống | Bấm "Đăng nhập" khi trống | Trình duyệt báo bắt buộc | P2 | |
| TC-ADM-006 | Email sai định dạng | `admin@` | Trình duyệt báo / "Email không hợp lệ" | P2 | |
| TC-ADM-007 | Sai mật khẩu | Mật khẩu sai | "Email hoặc mật khẩu không đúng." | P0 | |
| TC-ADM-008 | Email không tồn tại | `ai@test.vn` | **Cùng** thông báo như TC-ADM-007, thời gian phản hồi tương đương | P1 | |
| TC-ADM-009 | Khoá sau 5 lần sai | Sai mật khẩu STAFF2 5 lần | Lần 5 vẫn báo sai; lần 6 (kể cả mật khẩu **đúng**): "Tài khoản tạm khoá do nhập sai nhiều lần. Thử lại sau 15 phút." | P0 | |
| TC-ADM-010 | Hết khoá | Đợi 15 phút (hoặc ADMIN đặt lại mật khẩu STAFF2) | Đăng nhập được | P1 | |
| TC-ADM-011 | Đếm lại sau khi đúng | Sai 4 lần → đúng 1 lần → sai 4 lần | Không bị khoá | P2 | |
| TC-ADM-012 | Tài khoản bị khoá bởi ADMIN | ADMIN bấm "Khoá" STAFF2 → STAFF2 đăng nhập đúng mật khẩu | "Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên." | P0 | |
| TC-ADM-013 | Quá giới hạn đăng nhập | Bấm đăng nhập 11 lần trong 1 phút | Lần 11: "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút." (giới hạn chung cho cả admin) | P1 | |
| TC-ADM-014 | API tắt | Tắt API → đăng nhập | "Không kết nối được máy chủ API. Vui lòng thử lại sau." | P1 | |
| TC-ADM-015 | Đã đăng nhập mở `/login` | ADMIN mở `/login` | Chuyển về `/` | P2 | |
| TC-ADM-016 | STAFF mở `/login` khi đã đăng nhập | | Chuyển về `/` rồi `/orders?forbidden=1` — ghi nhận ([findings.md F-08](findings.md)) | P2 | |
| TC-ADM-017 | Cookie an toàn | DevTools → Application → Cookies | `admin_token` có HttpOnly, SameSite=Lax; `document.cookie` trong Console **không** chứa token | P0 | |
| TC-ADM-018 | Đăng xuất | Bấm "Đăng xuất" ở thanh bên | Về `/login`; bấm Back không vào lại được trang quản trị | P0 | |
| TC-ADM-019 | Phiên hết hạn | Đặt `JWT_EXPIRES_IN=1m` ở API, đăng nhập, đợi 2 phút, bấm menu | Về `/login` với khung vàng "Phiên đăng nhập đã hết hạn hoặc bị thu hồi…" | P1 | |
| TC-ADM-020 | Token bị sửa | Sửa giá trị cookie `admin_token` → tải lại | Về `/login?expired=1` | P1 | |
| TC-ADM-021 | Xoá cookie | Xoá cookie → bấm menu | Về `/login` | P1 | |

## 2. Bố cục, menu, phân quyền giao diện

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-030 | Menu ADMIN | Đăng nhập ADMIN | Có: Tổng quan, Đơn hàng, Liên hệ & báo giá, Sản phẩm, Danh mục, Banner trang chủ, Bài viết, Chính sách, Thông tin cửa hàng, Tài khoản nhân viên, Tài khoản của tôi | P0 | |
| TC-ADM-031 | Menu STAFF | Đăng nhập STAFF1 | **Không** có Tổng quan, Thông tin cửa hàng, Tài khoản nhân viên | P0 | |
| TC-ADM-032 | STAFF gõ URL cấm | STAFF1 mở `/`, `/settings`, `/users` | Chuyển `/orders?forbidden=1`, khung vàng "Tài khoản nhân viên không truy cập được trang vừa chọn." | P0 | |
| TC-ADM-033 | Số việc trên menu | Có 3 đơn "Chờ xác nhận", 2 liên hệ "Mới" | "Đơn hàng" có số 3, "Liên hệ & báo giá" có số 2; về 0 thì số biến mất | P1 | |
| TC-ADM-034 | Mục đang mở | Mở `/products/abc` | "Sản phẩm" được tô | P2 | |
| TC-ADM-035 | Logo / tên | Bấm khối logo đầu thanh bên | ADMIN → `/`, STAFF → `/orders` | P2 | |
| TC-ADM-036 | Menu điện thoại | Màn 375 px: bấm nút menu → bấm lớp tối bên ngoài | Thanh bên trượt ra; bấm ngoài thì đóng; chọn mục thì chuyển trang | P1 | |
| TC-ADM-037 | Bảng trên điện thoại | Mở Đơn hàng, Sản phẩm ở 375 px | Bảng cuộn ngang trong khung, trang không cuộn ngang | P1 | |

## 3. Tổng quan `/` (chỉ ADMIN)

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-050 | Mặc định 30 ngày | Mở `/` | Nút "30 ngày" được chọn; URL không có `days` | P1 | |
| TC-ADM-051 | Đổi khoảng | Bấm 7 ngày, 90 ngày, 1 năm | URL `?days=7/90/365`; số liệu đổi theo | P1 | |
| TC-ADM-052 | `days` sai | Mở `/?days=15`, `/?days=abc` | Coi như 30 ngày, không lỗi | P2 | |
| TC-ADM-053 | Doanh thu | Tạo 3 đơn (200k, 300k, 500k), huỷ đơn 500k | Doanh thu = 500.000 (không tính đơn huỷ); Số đơn, Giá trị TB/đơn, "N sản phẩm đã bán", Đơn bị huỷ + tỷ lệ huỷ khớp tính tay | P0 | |
| TC-ADM-054 | So với kỳ trước | Có đơn ở kỳ trước | Dòng phụ % tăng/giảm có màu xanh/đỏ hợp lý; kỳ trước = 0 thì không chia cho 0 | P1 | |
| TC-ADM-055 | Biểu đồ | 7/30 ngày: "Theo ngày"; 90: "Gộp theo tuần"; 1 năm: "Gộp theo tháng" | Rê chuột vào cột hiện "{ngày}: {doanh thu} · {N} đơn" | P2 | |
| TC-ADM-056 | Múi giờ VN | Đơn đặt lúc 23:30 giờ VN | Tính vào **ngày đó** (không sang ngày hôm sau theo UTC) | P1 | |
| TC-ADM-057 | Bán chạy, theo danh mục, theo trạng thái, theo phương thức | So với dữ liệu đơn | Số liệu khớp; danh mục đổi tên vẫn tính đúng | P1 | |
| TC-ADM-058 | Đơn gần đây | Bấm một đơn | Mở chi tiết đơn | P2 | |
| TC-ADM-059 | Kho & danh mục | Có quy cách sắp hết / hết | Liệt kê đúng | P2 | |
| TC-ADM-060 | Lối tắt việc cần làm | Bấm link đơn chờ xác nhận / liên hệ mới | Mở `/orders?status=pending`, `/inquiries?status=new` | P2 | |
| TC-ADM-061 | DB rỗng | Không có đơn nào | Trang hiện 0 ở mọi ô, không lỗi | P1 | |

## 4. Danh sách đơn `/orders`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-080 | Danh sách | Mở `/orders` | Đơn mới nhất trước; cột mã (link), khách + SĐT, trạng thái (màu), tiền, ngày | P0 | |
| TC-ADM-081 | Tab trạng thái | Bấm từng tab trạng thái và "Tất cả" | Lọc đúng; tab đang chọn gạch chân đỏ | P1 | |
| TC-ADM-082 | Tìm mã | Gõ 6 ký tự cuối của mã, chữ thường | Ra đúng đơn | P1 | |
| TC-ADM-083 | Tìm tên | Gõ một phần tên, không phân biệt hoa thường | Ra đúng | P1 | |
| TC-ADM-084 | Tìm SĐT | Đơn đặt bằng `0905123456`; tìm `0905 123 456` và `905123` | Ra đúng | P1 | |
| TC-ADM-085 | Tìm + lọc | Tab "Đã giao" + tìm tên | Kết quả thoả cả hai; chuyển trang giữ nguyên bộ lọc | P2 | |
| TC-ADM-086 | Phân trang | Có > 20 đơn | Có nút trang; trang 2 hiện đơn 21–40 | P2 | |
| TC-ADM-087 | Không có kết quả | Tìm "zzzz" | Thông báo rỗng, không lỗi | P2 | |

## 5. Chi tiết đơn `/orders/[id]`

### 5.1. Hiển thị
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-100 | Thông tin | Mở đơn vừa đặt | Mã, trạng thái, sản phẩm (tên, quy cách, đơn giá, SL, thành tiền), tạm tính / phí ship / giảm / tổng, khách, SĐT (bấm gọi được), địa chỉ, ghi chú khách, phương thức thanh toán | P0 | |
| TC-ADM-101 | Lịch sử | Xem "Lịch sử xử lý" | Dòng đầu "Chờ xác nhận — Khách đặt hàng qua website"; mỗi lần đổi trạng thái thêm dòng: từ → tới, ghi chú, người đổi, thời gian | P0 | |
| TC-ADM-102 | Bản chụp | Đổi tên / giá / xoá P1 sau khi đặt | Đơn vẫn hiện tên, quy cách, giá lúc đặt | P0 | |
| TC-ADM-103 | In phiếu | Bấm "In" | Hộp in mở; bản in **không** có thanh bên, form xử lý, nút; đủ thông tin giao hàng | P1 | |
| TC-ADM-104 | Mã HTML | Đơn có tên `<img src=x onerror=alert(1)>` | Hiện nguyên văn, không chạy script | P0 | |
| TC-ADM-105 | ID sai | Mở `/orders/khongco` | Thông báo lỗi / không tìm thấy, không trắng trang | P2 | |

### 5.2. Xử lý đơn
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-120 | Nút nhanh theo trạng thái | Xem đơn ở từng trạng thái | Chờ xác nhận → "Xác nhận đơn"; Đã xác nhận → "Bắt đầu đóng gói"; Đóng gói → "Giao cho vận chuyển"; Đang giao → "Đã giao thành công" | P0 | |
| TC-ADM-121 | Xác nhận + phí ship | Nhập phí ship 30.000 → bấm "Xác nhận đơn" | Trạng thái "Đã xác nhận"; phí ship 30.000; tổng = tạm tính + 30.000; "Đã cập nhật đơn hàng."; lịch sử có dòng mới | P0 | |
| TC-ADM-122 | Bỏ qua đóng gói | Đơn "Đã xác nhận": chọn "→ Đang giao" ở ô "Chuyển trạng thái" → Lưu | Chuyển được thẳng sang Đang giao | P1 | |
| TC-ADM-123 | Ô chuyển trạng thái chỉ có bước hợp lệ | Mở ô ở từng trạng thái | Chờ xác nhận: Đã xác nhận, Đã huỷ · Đã xác nhận: Đóng gói, Đang giao, Đã huỷ · Đóng gói: Đang giao, Đã huỷ · Đang giao: Đã giao, Đã huỷ | P0 | |
| TC-ADM-124 | Huỷ — bấm Cancel | Bấm "Huỷ đơn" → Cancel ở hộp xác nhận | Không có gì thay đổi | P0 | |
| TC-ADM-125 | Huỷ — bấm OK | Bấm "Huỷ đơn" → OK | Trạng thái "Đã huỷ"; doanh thu Tổng quan không tính đơn này | P0 | |
| TC-ADM-126 | Đơn đã kết thúc | Mở đơn Đã giao / Đã huỷ | Không có nút nhanh; ô trạng thái, ghi chú cập nhật, phí ship, giảm giá bị khoá kèm gợi ý "Đơn đã kết thúc…"; **vẫn** đổi được "Thanh toán" và "Ghi chú nội bộ" | P0 | |
| TC-ADM-127 | Ghi chú cập nhật | Nhập "Đã gọi khách, giao 15h" → chuyển trạng thái | Ghi chú nằm trong lịch sử của lần chuyển đó | P1 | |
| TC-ADM-128 | Ghi chú khi không đổi trạng thái | Nhập ghi chú, giữ nguyên trạng thái → Lưu | Không thêm dòng lịch sử (ghi chú cập nhật chỉ lưu khi đổi trạng thái) — ghi nhận | P2 | |
| TC-ADM-129 | Giảm giá | Tạm tính 330.000, phí ship 30.000, giảm 50.000 | Tổng 310.000 | P0 | |
| TC-ADM-130 | Giảm giá quá lớn | Giảm 400.000 (> 360.000) | "Giảm giá không được lớn hơn tổng tiền đơn hàng."; không đổi dữ liệu | P0 | |
| TC-ADM-131 | Số âm | Phí ship −1000 | Trình duyệt chặn (min 0) | P1 | |
| TC-ADM-132 | Phí ship quá lớn | 10.000.001 | Lỗi từ API (tối đa 10.000.000) | P2 | |
| TC-ADM-133 | Xoá trống ô phí ship | Xoá số trong ô → Lưu | Phí ship = 0 | P2 | |
| TC-ADM-134 | Thanh toán | Đổi "Đã thanh toán" → Lưu | Lưu; web tra cứu thấy "Đã thanh toán" | P0 | |
| TC-ADM-135 | Ghi chú nội bộ | Nhập 2000 ký tự → Lưu | Lưu; khách tra cứu **không** thấy | P1 | |
| TC-ADM-136 | Hai người cùng sửa | ADMIN và STAFF1 cùng mở 1 đơn; STAFF1 xác nhận | Trang của ADMIN tự cập nhật trạng thái; ADMIN bấm "Xác nhận đơn" (nút cũ) → lỗi "Không thể chuyển đơn hàng sang trạng thái này." hoặc trang đã đổi nút — không tạo trạng thái sai | P1 | |
| TC-ADM-137 | Nút nhanh lấy ưu tiên hơn ô chọn | Chọn "→ Đã huỷ" ở ô chuyển trạng thái nhưng bấm nút "Xác nhận đơn" | Đơn chuyển "Đã xác nhận" (nút bấm thắng) | P2 | |
| TC-ADM-138 | STAFF xử lý đơn | Đăng nhập STAFF1, làm TC-ADM-121 | Làm được; lịch sử ghi tên STAFF1 | P0 | |

## 6. Liên hệ & báo giá `/inquiries`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-150 | Danh sách | Gửi 1 liên hệ từ web | Mục mới nhất ở đầu; nhãn "Liên hệ", trạng thái "Mới", tên, SĐT (`tel:`), email (`mailto:`), nội dung giữ xuống dòng, thời gian. Liên hệ báo giá sỉ cũ (seed) vẫn hiện đủ tên quán, nhu cầu | P0 | |
| TC-ADM-151 | Lọc | Bấm từng chip trạng thái, từng chip loại, kết hợp | Lọc đúng | P1 | |
| TC-ADM-152 | Đổi trạng thái | Bấm "Đánh dấu: Đang xử lý" rồi "Đánh dấu: Xong" | Nhãn đổi; chỉ hiện nút của **trạng thái khác** trạng thái hiện tại; số trên menu giảm khi rời "Mới" | P1 | |
| TC-ADM-153 | Xoá — Cancel | Bấm "Xoá" → Cancel | Không xoá | P1 | |
| TC-ADM-154 | Xoá — OK | Bấm "Xoá" → OK | Nút "Đang xoá..."; mục biến mất | P1 | |
| TC-ADM-155 | Mã HTML | Liên hệ có nội dung `<script>` | Hiện nguyên văn | P0 | |

## 7. Sản phẩm `/products`

### 7.1. Danh sách
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-170 | Chưa có danh mục | DB mới | Có nút "Tạo danh mục trước" → `/categories/new` | P2 | |
| TC-ADM-171 | Nhãn | Xem P1, P2, P3 | P1: "Nổi bật", "Còn hàng". P2: "1 hết hàng". P3: "Nổi bật", "Chưa có ảnh", "1 hết hàng", "1 sắp hết". Không còn nhãn "Bán sỉ" | P1 | |
| TC-ADM-172 | Lọc | Tên "xoài" + danh mục C1 + trạng thái (Đang bán / Đã ẩn / Tất cả) → "Lọc" | Đúng điều kiện; P4 chỉ hiện khi chọn Đã ẩn / Tất cả | P1 | |
| TC-ADM-173 | Bật/tắt nhanh | Bấm trạng thái "Đang bán" của P1 | Đổi thành ẩn; web: P1 biến mất ngay. Bấm lại → hiện lại | P0 | |
| TC-ADM-174 | Sửa | Bấm "Sửa" | Mở form có sẵn dữ liệu | P1 | |
| TC-ADM-175 | Xoá | Bấm "Xoá" → OK | Sản phẩm biến mất khỏi admin và web; đơn cũ chứa sản phẩm vẫn xem được (bản chụp) | P0 | |

### 7.2. Form thêm / sửa
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-190 | Tạo đầy đủ | Nhập P1 theo bảng dữ liệu → "Tạo sản phẩm" | Về `/products`, P1 có trong danh sách; web hiện đúng mọi trường | P0 | |
| TC-ADM-191 | Thiếu tên / danh mục | Bỏ trống | Trình duyệt báo bắt buộc | P1 | |
| TC-ADM-192 | Slug tự sinh | Tên "Xoài Cát Hòa Lộc", slug trống | Slug = `xoai-cat-hoa-loc` | P1 | |
| TC-ADM-193 | Slug sai mẫu | `Xoai Cat`, `xoai--cat`, `-xoai` | Trình duyệt chặn theo mẫu | P2 | |
| TC-ADM-194 | Slug trùng | Tạo sản phẩm thứ 2 cùng tên | "Đường dẫn (slug) này đã được dùng, hãy chọn tên khác." | P1 | |
| TC-ADM-195 | Giữ dữ liệu khi lỗi | Ở TC-ADM-194, xem lại form | Các ô đã nhập, ảnh, quy cách **còn nguyên** — kiểm kỹ ([findings.md F-02](findings.md)) | P0 | |
| TC-ADM-196 | Tên chỉ có ký hiệu | Tên "!!!", slug trống | Ghi nhận hành vi (slug rỗng?) — [findings.md F-09](findings.md) | P2 | |
| TC-ADM-197 | Hạn sử dụng | 0, 3651, 30, để trống | 0 / 3651 bị chặn; 30 → web "30 ngày kể từ ngày sản xuất"; trống → không hiện dòng | P2 | |
| TC-ADM-198 | Các ô chọn | Bỏ "Đang bán", chọn "Nổi bật" | Web: không hiện / hiện ở nổi bật; form không còn ô "Nhận đặt sỉ" | P1 | |
| TC-ADM-199 | Thứ tự hiển thị | P1 = 2, P3 = 1 | Web sắp xếp mặc định P3 trước P1 | P2 | |
| TC-ADM-200 | Huỷ | Bấm "Huỷ" | Về `/products`, không lưu | P2 | |
| TC-ADM-201 | Danh mục bị xoá giữa chừng | Mở form, tab khác xoá danh mục đã chọn → Lưu | "Danh mục không tồn tại." | P2 | |

### 7.3. Ảnh sản phẩm
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-220 | Tải nhiều ảnh | Chọn 3 file JPG/PNG/WEBP cùng lúc | Nút báo đang tải; 3 ảnh xuất hiện theo thứ tự; ảnh đầu là ảnh chính | P0 | |
| TC-ADM-221 | Đổi thứ tự | Bấm → ở ảnh 1, ← ở ảnh 3 | Thứ tự đổi; ← ở ảnh đầu và → ở ảnh cuối bị mờ; lưu → web dùng ảnh đầu mới làm ảnh chính | P1 | |
| TC-ADM-222 | Xoá ảnh | Bấm "Xoá" trên ảnh → Lưu | Ảnh biến mất khỏi sản phẩm | P1 | |
| TC-ADM-223 | Tối đa 12 ảnh | Đã có 10 ảnh, chọn 5 file | Chỉ tải 2 file đầu; khi đủ 12 không thêm được nữa | P1 | |
| TC-ADM-224 | Sai định dạng | Chọn `.svg`, `.pdf` | Hộp chọn file chỉ cho ảnh; nếu ép chọn → "{tên file}: Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF." | P0 | |
| TC-ADM-225 | File giả mạo | Đổi tên `virus.txt` → `virus.jpg`, tải lên | Bị từ chối như TC-ADM-224 | P0 | |
| TC-ADM-226 | Quá 5 MB | Ảnh 6 MB | "Ảnh vượt quá 5MB, vui lòng chọn ảnh nhỏ hơn." | P0 | |
| TC-ADM-227 | Một lỗi trong nhiều file | Chọn 2 ảnh tốt + 1 ảnh 6 MB | 2 ảnh tốt vẫn được thêm; lỗi ghi tên file hỏng | P1 | |
| TC-ADM-228 | Ảnh đã tải nhưng không lưu | Tải ảnh rồi bấm "Huỷ" | Sản phẩm không đổi (file thừa trên đĩa — chấp nhận) | P2 | |

### 7.4. Quy cách đóng gói
| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-240 | Thêm quy cách | Bấm "+ Thêm quy cách" | Thêm một khối trống | P0 | |
| TC-ADM-241 | Xoá quy cách | Có 2 quy cách: bấm xoá khối 2; còn 1: nút xoá mờ | Không thể xoá quy cách cuối cùng | P0 | |
| TC-ADM-242 | Chuyển lên | Bấm "Chuyển lên" ở khối 2 | Đổi chỗ; khối đầu không có nút này hoạt động; web hiện theo thứ tự mới | P2 | |
| TC-ADM-243 | Thiếu tên / giá | Bỏ trống "Quy cách" hoặc "Giá bán" | Trình duyệt báo bắt buộc | P0 | |
| TC-ADM-244 | Trùng tên | Hai quy cách "500g" và "500G" | "Các quy cách đóng gói không được trùng tên." | P1 | |
| TC-ADM-245 | Giá/kg | Khối lượng 500, giá 85.000 | Dòng gợi ý "≈ 170.000 ₫/kg"; không có khối lượng → "Nhập khối lượng để hiện giá/kg cho khách" | P2 | |
| TC-ADM-246 | Giá gốc ≤ giá bán | Giá 85.000, giá gốc 80.000 | Lưu được, nhưng giá gốc **bị bỏ** (web không gạch ngang) — ghi nhận | P1 | |
| TC-ADM-247 | Giá 0 | Giá 0 | Lưu được; web hiện 0 ₫ — xác nhận có chấp nhận nghiệp vụ không | P2 | |
| TC-ADM-248 | Giá lẻ | 85.500,5 | Trình duyệt chặn (bước 500) hoặc API "Giá phải là số nguyên (đồng)" | P2 | |
| TC-ADM-249 | SKU trùng | SKU giống quy cách của sản phẩm khác | "Mã SKU này đã tồn tại." | P2 | |
| TC-ADM-250 | Tồn kho | Đặt Còn hàng / Sắp hết / Hết hàng | Web hiện tương ứng (TC-WEB-177…179) | P0 | |
| TC-ADM-251 | Sửa quy cách giữ id | Khách có P1 500g trong giỏ; admin sửa giá 500g | Khách vào checkout: dòng vẫn hợp lệ, giá mới | P0 | |
| TC-ADM-252 | Xoá quy cách đang trong giỏ | Khách có P1 1kg trong giỏ; admin xoá 1kg | Xem TC-WEB-246 | P1 | |
| TC-ADM-253 | Quá 20 quy cách | Thêm 21 khối → Lưu | Lỗi từ API (tối đa 20) | P2 | |
| TC-ADM-254 | Tắt một quy cách | Bỏ ô "Đang bán" của P1 1kg → Lưu | Khối quy cách viền nét đứt; web: P1 chỉ còn 500g, nhãn thẻ đổi thành "500g"; khách có 1kg trong giỏ → checkout "Sản phẩm đã ngừng bán" | P0 | |
| TC-ADM-255 | Tắt hết quy cách | Bỏ "Đang bán" ở mọi quy cách của P1 → Lưu | P1 biến khỏi web (API chỉ công khai sản phẩm có ≥ 1 quy cách đang bán); slug → 404 | P1 | |

## 8. Danh mục `/categories`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-270 | Tạo | Tên, mô tả, ảnh, thứ tự → "Tạo danh mục" | Có trong danh sách; slug tự sinh; web menu thả xuống có danh mục mới | P0 | |
| TC-ADM-271 | Ảnh đại diện | Tải ảnh, "Đổi ảnh", nút gỡ ảnh | Hoạt động; lỗi định dạng/dung lượng như §7.3 | P1 | |
| TC-ADM-272 | Ẩn danh mục | Bỏ chọn "Hiển thị trên website" ở C1 | Web: C1 mất khỏi menu, chip, trang chủ; **mọi sản phẩm C1 biến mất**; slug sản phẩm C1 → 404; khách có P1 trong giỏ → checkout "Sản phẩm đã ngừng bán" | P0 | |
| TC-ADM-273 | Xoá danh mục còn sản phẩm | Xoá C1 | "Danh mục còn N sản phẩm. Hãy chuyển hoặc xoá sản phẩm trước, hoặc tắt hiển thị danh mục." (đếm cả sản phẩm đã ẩn) | P0 | |
| TC-ADM-274 | Xoá danh mục rỗng | Xoá C4 → OK | Xoá được | P1 | |
| TC-ADM-275 | Slug trùng / sai mẫu | Như TC-ADM-193, 194 | Như sản phẩm | P2 | |
| TC-ADM-276 | Đổi slug | Đổi slug C1 | Web: link cũ `?category=slug-cũ` ra 0 sản phẩm; link mới đúng | P2 | |

## 9. Banner `/banners`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-290 | Tạo B1 | Ảnh, tiêu đề, mô tả, liên kết "Sản phẩm", chữ nút "Mua ngay" → "Tạo banner" | Web trang chủ hiện banner đúng | P0 | |
| TC-ADM-291 | Thiếu ảnh | Không tải ảnh → Tạo | Báo lỗi ảnh (ví dụ "Đường dẫn ảnh không hợp lệ"), không tạo | P1 | |
| TC-ADM-292 | Chọn liên kết có sẵn | Mở ô "Liên kết khi bấm" | Có "— Không có liên kết —", các nhóm trang/danh mục/sản phẩm, "Link tự nhập…" cuối | P1 | |
| TC-ADM-293 | Link tự nhập hợp lệ | `/products?category=xoai`, `https://zalo.me/0396799579` | Lưu được; bấm nút trên web mở đúng | P1 | |
| TC-ADM-294 | Link tự nhập sai | `zalo.me/123`, `javascript:alert(1)` | "Liên kết phải bắt đầu bằng "/" hoặc http(s)://" | P0 | |
| TC-ADM-295 | Sửa banner có link tự nhập | Mở lại B có link tự nhập | Ô chọn đang ở "Link tự nhập…", ô nhập có link cũ | P2 | |
| TC-ADM-296 | Không liên kết | Chọn "— Không có liên kết —" | Web không có nút | P2 | |
| TC-ADM-297 | Ẩn / thứ tự / xoá | Bỏ "Hiển thị trên trang chủ"; đổi thứ tự; xoá | Web cập nhật tương ứng | P1 | |
| TC-ADM-298 | Ảnh khác tỉ lệ | Ảnh dọc 800×1200 | Web cắt vừa khung, không méo (ghi nhận chất lượng hiển thị) | P2 | |
| TC-ADM-299 | Lọc theo vị trí | Bấm tab "Trang chủ (trình chiếu)", "Đầu trang Sản phẩm", "Tất cả" | Bảng chỉ còn banner đúng vị trí; cột "Vị trí" có nhãn tương ứng; "+ Thêm banner" ở tab Sản phẩm mở form chọn sẵn vị trí Sản phẩm | P1 | |
| TC-ADM-300 | Banner trang Sản phẩm | Tạo banner vị trí "Đầu trang Sản phẩm" có ảnh, tiêu đề, mô tả | Form ẩn ô "Liên kết" và "Chữ trên nút", khung xem ảnh tỉ lệ 4:1; web `/products`: ảnh nền, tiêu đề, mô tả mới (khi lọc danh mục vẫn hiện tên danh mục); trang chủ **không** có banner này | P0 | |
| TC-ADM-301 | Nhiều banner trang Sản phẩm | Bật 2 banner vị trí Sản phẩm, thứ tự 1 và 2; rồi tắt banner thứ tự 1 | Web dùng banner thứ tự 1; tắt đi thì dùng banner thứ tự 2; tắt hết thì về ảnh mặc định, tiêu đề "Tất cả trái cây đông lạnh" | P1 | |
| TC-ADM-303 | Banner trang Tin tức | Tạo banner vị trí "Đầu trang Tin tức" | Web `/news` dùng ảnh, tiêu đề, mô tả của banner (khi lọc loại bài thì tiêu đề theo loại); tắt hết thì về ảnh mặc định | P1 | |
| TC-ADM-302 | Đổi vị trí banner có liên kết | Sửa banner trang chủ có liên kết → đổi sang "Đầu trang Sản phẩm" → Lưu | Liên kết và chữ trên nút bị xoá (banner trang Sản phẩm không có nút) | P2 | |

## 10. Bài viết `/posts` và chính sách `/policies`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-310 | Đăng ngay | Tiêu đề, tóm tắt, nội dung, ảnh bìa, ngày đăng trống → "Đăng bài viết" | Danh sách: nhãn "Đang hiển thị"; web `/news` có bài | P0 | |
| TC-ADM-311 | Hẹn giờ | Ngày đăng = ngày mai | Nhãn "Hẹn giờ đăng"; web chưa thấy | P1 | |
| TC-ADM-312 | Bản nháp | Bỏ "Hiển thị trên website" | Nhãn "Bản nháp"; web không thấy | P1 | |
| TC-ADM-313 | Giờ Việt Nam | Đặt ngày đăng 08:00 hôm nay → mở lại form | Ô vẫn hiện 08:00 (không lệch 7 giờ); web hiện đúng ngày | P1 | |
| TC-ADM-314 | Loại bài viết | Viết bài chọn "Tuyển dụng"; mở `/posts/new?type=recruitment` | Ô loại bắt buộc, mặc định Kiến thức (hoặc Tuyển dụng khi mở từ tab Tuyển dụng); danh sách có cột Loại và tab lọc kèm số bài; web hiện bài ở tab tương ứng | P1 | |
| TC-ADM-315 | Thiếu tiêu đề / slug trùng | | Trình duyệt báo / "Đường dẫn (slug) này đã được dùng…" | P2 | |
| TC-ADM-316 | Sửa, xoá bài | | Web cập nhật; bài xoá → 404 | P1 | |
| TC-ADM-330 | Mẫu chính sách | DB chưa có chính sách đổi trả | Khung "Có nội dung soạn sẵn từ tài liệu cửa hàng:" kèm nút mẫu; bấm → form điền sẵn tiêu đề, slug, nội dung | P1 | |
| TC-ADM-331 | Hết gợi ý mẫu | Lưu chính sách từ mẫu | Khung gợi ý mẫu biến mất | P2 | |
| TC-ADM-332 | Tạo / ẩn / thứ tự / xoá chính sách | | Chân trang web: chỉ chính sách đang hiện, theo thứ tự; chính sách ẩn → 404 | P1 | |

## 11. Thông tin cửa hàng `/settings` (chỉ ADMIN)

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-350 | Lần đầu | DB mới, mở trang | Form điền sẵn thông tin mặc định của cửa hàng | P1 | |
| TC-ADM-351 | Lưu hợp lệ | Sửa hotline, giờ, Zalo, email, Facebook, địa chỉ, mốc, link bản đồ, chuyển khoản, MST → Lưu | Thông báo thành công; web header, footer, liên hệ, nút nổi, trang đặt hàng thành công cập nhật ngay | P0 | |
| TC-ADM-352 | Bắt buộc | Xoá tên cửa hàng / tên rút gọn / hotline | Trình duyệt báo bắt buộc | P1 | |
| TC-ADM-353 | Hotline sai | `abc`, `123` | "Số điện thoại không hợp lệ" | P1 | |
| TC-ADM-354 | Zalo sai | `abc` | "Số Zalo không hợp lệ"; để trống → hợp lệ (dùng hotline) | P2 | |
| TC-ADM-355 | URL sai | Facebook `facebook.com/abc`, bản đồ `maps` | Trình duyệt báo URL / "Link Facebook phải là URL http(s)", "Link bản đồ phải là URL http(s)" | P1 | |
| TC-ADM-356 | Dải chữ chạy | Bật/tắt, đổi nội dung | Xem TC-WEB-001…003 | P2 | |
| TC-ADM-357 | STAFF | STAFF1 mở `/settings` | Bị chặn (TC-ADM-032) | P0 | |

## 12. Realtime

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-370 | Đơn mới | Mở admin ở `/products`; khách đặt hàng | Góc màn hình: "Đơn hàng mới {mã}" + tên khách + tiền, có âm báo; số trên menu "Đơn hàng" +1 | P0 | |
| TC-ADM-371 | Liên hệ mới | Khách gửi liên hệ | Thông báo "Liên hệ mới"; số trên menu +1 | P0 | |
| TC-ADM-372 | Tab ẩn | Chuyển admin sang tab khác; khách đặt 2 đơn | Tiêu đề tab admin thành "(2) …"; quay lại tab thì số tự xoá | P1 | |
| TC-ADM-373 | Đóng thông báo | Bấm nút đóng; hoặc đợi | Thông báo biến mất; nhiều thông báo xếp chồng, tối đa vài cái | P2 | |
| TC-ADM-374 | Trang đang xem tự làm mới | Admin mở `/orders`; khách đặt đơn | Đơn mới xuất hiện trong bảng không cần F5 | P0 | |
| TC-ADM-375 | Form đang nhập không mất | Đang gõ dở form sản phẩm; khách đặt đơn | Chữ đang gõ giữ nguyên | P0 | |
| TC-ADM-376 | Âm báo bị trình duyệt chặn | Mở admin, chưa bấm gì trên trang, khách đặt đơn | Ghi nhận: âm có thể không kêu tới khi người dùng tương tác trang (chính sách autoplay) | P2 | |
| TC-ADM-377 | Phiên bị thu hồi | STAFF1 đang mở admin; ADMIN khoá STAFF1 | Trong ≤ 60 giây, trang STAFF1 tự về `/login` | P0 | |
| TC-ADM-378 | API khởi động lại | Tắt API rồi bật | Admin tự kết nối lại, tải lại dữ liệu | P2 | |
| TC-ADM-379 | Nhiều tab | Mở 10 tab admin cùng trình duyệt, rồi mở thêm tab và lưu một bài viết | Mọi tab vẫn bấm được, lưu ngay; DevTools → Network chỉ có **1** kết nối `/api/events` đang mở; đơn mới → mọi tab hiện thông báo, chỉ **một** tiếng âm báo; đóng tab đầu → tab khác vẫn nhận thông báo | P0 | |

## 13. Tài khoản nhân viên `/users` (chỉ ADMIN)

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-390 | Danh sách | Mở trang | ADMIN trước (nhãn "Quản trị", **không** có nút thao tác), các STAFF (nhãn "Nhân viên") kèm đăng nhập gần nhất | P0 | |
| TC-ADM-391 | Tạo STAFF | Họ tên, email, mật khẩu `Staff@1234` → "Tạo tài khoản" | Có trong danh sách; STAFF đăng nhập được | P0 | |
| TC-ADM-392 | Mật khẩu ngắn | 7 ký tự | Trình duyệt báo tối thiểu 8 | P1 | |
| TC-ADM-393 | Email trùng | Email của STAFF1 hoặc của ADMIN | "Email này đã được dùng cho tài khoản khác." | P1 | |
| TC-ADM-394 | Email hoa thường | `STAFF3@TEST.VN` | Lưu thành chữ thường | P2 | |
| TC-ADM-395 | Đặt lại mật khẩu | Bấm "Đặt lại mật khẩu" → nhập mới → "Lưu" (và thử nút huỷ) | Lưu: STAFF đăng nhập bằng mật khẩu mới; mật khẩu cũ hết tác dụng; **mọi thiết bị STAFF đang đăng nhập bị đăng xuất**; mở khoá nếu đang bị khoá do sai mật khẩu | P0 | |
| TC-ADM-396 | Khoá / mở khoá | Bấm "Khoá" STAFF2 → "Mở khoá" | Khoá: STAFF2 đang mở admin bị đăng xuất ở thao tác kế tiếp; không đăng nhập được. Mở khoá: đăng nhập lại được | P0 | |
| TC-ADM-397 | Xoá STAFF | Xoá STAFF2 → OK | Biến mất; STAFF2 đang đăng nhập bị đăng xuất; lịch sử đơn STAFF2 từng xử lý vẫn còn, cột người đổi trống | P1 | |

## 14. Tài khoản của tôi `/account`

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-410 | Thông tin | Mở trang | Tên, email, vai trò của người đang đăng nhập | P2 | |
| TC-ADM-411 | Sai mật khẩu hiện tại | | "Mật khẩu hiện tại không đúng." | P1 | |
| TC-ADM-412 | Nhập lại không khớp | | "Mật khẩu nhập lại không khớp." | P1 | |
| TC-ADM-413 | Trùng mật khẩu cũ | Mới = cũ | "Mật khẩu mới phải khác mật khẩu hiện tại." | P2 | |
| TC-ADM-414 | Quá ngắn | 7 ký tự | Trình duyệt báo tối thiểu 8 | P2 | |
| TC-ADM-415 | Đổi thành công | Đăng nhập cùng tài khoản ở 2 trình duyệt; đổi ở trình duyệt A | A: "Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất." và **vẫn đăng nhập**; B: thao tác kế tiếp về `/login` | P0 | |

## 15. Trình soạn thảo nội dung

Thử ở Bài viết; lặp nhanh ở Chính sách, Mô tả sản phẩm, Trang Giới thiệu.

| ID | Kịch bản | Các bước | Kết quả mong đợi | Ưu tiên | KQ |
|---|---|---|---|:-:|:-:|
| TC-ADM-430 | Định dạng cơ bản | Gõ chữ; Ctrl+B, Ctrl+I, Ctrl+U; bấm Tiêu đề, Tiêu đề nhỏ, danh sách, trích dẫn | Nút đang áp dụng tô đen; lưu xong web hiện đúng định dạng | P0 | |
| TC-ADM-431 | Ảnh từ nút | Bấm "Ảnh", chọn 2 ảnh | Nút báo "Đang tải 2 ảnh…"; 2 ảnh chèn tại con trỏ, mỗi ảnh có ô "Nhập chú thích ảnh…" | P0 | |
| TC-ADM-432 | Dán / kéo-thả ảnh | Copy ảnh rồi Ctrl+V; kéo file ảnh từ máy thả vào giữa 2 đoạn | Ảnh được tải lên và chèn đúng chỗ | P1 | |
| TC-ADM-433 | Chú thích ảnh | Bấm dưới ảnh, gõ chú thích; để trống ở ảnh khác | Web: chú thích căn giữa dưới ảnh; ảnh không chú thích thì không có dòng trống | P1 | |
| TC-ADM-434 | Xoá / di chuyển ảnh | Rê chuột vào ảnh → "Xoá ảnh"; kéo ảnh sang vị trí khác | Xoá đúng ảnh; ảnh chuyển chỗ, chú thích đi theo | P1 | |
| TC-ADM-435 | Ảnh sai | Ảnh 6 MB; file `.pdf` | Báo "…: ảnh vượt quá 5MB." / không nhận file không phải ảnh | P1 | |
| TC-ADM-436 | Ô sản phẩm | Bấm "Sản phẩm" → bấm chọn 4 sản phẩm (hiện số 1–4) → "Chèn 4 sản phẩm" | Trình soạn thảo: 4 thẻ (ảnh, tên, giá) xếp một hàng; web: một hàng 4 thẻ (điện thoại hiện 2, tự lướt) có giá hiện tại, nút + thêm giỏ | P0 | |
| TC-ADM-446 | Dán link sản phẩm | Ở dòng trống dán `http://localhost:3000/products/mit-thai-mui` (hoặc `/products/…`); ở dòng có chữ dán link | Dòng trống → thành ô sản phẩm; dòng có chữ → giữ là link chữ thường | P1 | |
| TC-ADM-447 | Link sản phẩm gõ tay | Nút "Liên kết" → `products/dau-tay-cat-lat`, link nằm riêng một dòng | Lưu thành `/products/dau-tay-cat-lat` (không thành `https://products/…`); web hiện thành thẻ sản phẩm | P1 | |
| TC-ADM-437 | Ô sản phẩm đã ẩn | Chèn ô P1, rồi tắt "Đang bán" P1 → mở lại bài | Ô báo "đã ẩn hoặc bị xoá — ô này sẽ không hiện trên web"; web không hiện ô đó, phần còn lại bình thường | P1 | |
| TC-ADM-438 | Giá trong ô luôn mới | Đổi giá P1 sau khi đăng bài | Ô sản phẩm trên web hiện giá mới (không cần sửa bài) | P1 | |
| TC-ADM-439 | Liên kết | Chọn chữ → "Liên kết" → `zalo.me/0396799579` → Enter; sửa lại → "Bỏ liên kết" | Web: link `https://zalo.me/…` mở tab mới; link `/products` mở cùng tab; bỏ liên kết thì còn chữ thường | P1 | |
| TC-ADM-440 | Khung ghi chú | Bấm "Ghi chú", gõ; bấm "Cảnh báo" khi đang trong khung; bấm lại để bỏ | Khung đổi xanh ↔ đỏ, bấm lần nữa thì bỏ khung | P2 | |
| TC-ADM-441 | Dán từ Word / web khác | Dán đoạn có màu chữ, cỡ chữ, bảng, ảnh | Giữ đậm/nghiêng/tiêu đề/danh sách; màu, cỡ chữ, font bị bỏ; không vỡ trình soạn thảo | P1 | |
| TC-ADM-442 | Rời trang chưa lưu | Sửa nội dung rồi bấm menu khác / đóng tab | Trình duyệt hỏi xác nhận rời trang; bấm Lưu thì không hỏi | P2 | |
| TC-ADM-443 | Nội dung cũ | Mở chính sách / bài viết tạo trước khi có trình soạn thảo | Nội dung giữ đúng đoạn và xuống dòng | P0 | |
| TC-ADM-444 | Trang Giới thiệu | Menu "Trang Giới thiệu" → sửa tiêu đề, dòng giới thiệu, thêm ảnh + ô sản phẩm → "Lưu trang" | "Đã lưu…"; web `/about` cập nhật ngay; lần đầu mở có sẵn nội dung đang hiển thị | P0 | |
| TC-ADM-445 | STAFF | Đăng nhập STAFF1 | Sửa được bài viết, chính sách, trang Giới thiệu | P2 | |
