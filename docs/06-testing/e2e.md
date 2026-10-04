# Kịch bản xuyên suốt (end-to-end)

Mỗi kịch bản đi qua nhiều app như người dùng thật. Chạy **toàn bộ** trước mỗi lần phát hành. Mở sẵn: web (cửa sổ khách), admin ADMIN (cửa sổ 2), admin STAFF1 (cửa sổ ẩn danh). Luồng kỹ thuật tương ứng: [request-flows.md](../02-architecture/request-flows.md).

| ID | Kịch bản | Ưu tiên | KQ |
|---|---|:-:|:-:|
| E2E-01 | Mua hàng COD trọn vòng | P0 | |
| E2E-02 | Mua hàng chuyển khoản | P0 | |
| E2E-03 | Giá đổi khi khách đang thanh toán | P0 | |
| E2E-04 | Hết hàng khi khách đang thanh toán | P0 | |
| E2E-05 | Khách huỷ qua điện thoại | P1 | |
| E2E-06 | Báo giá sỉ | P1 | |
| E2E-07 | Nhân viên nghỉ việc | P0 | |
| E2E-08 | Ra mắt sản phẩm mới | P1 | |
| E2E-09 | Ngừng bán cả danh mục | P1 | |
| E2E-10 | Xoá sản phẩm đã có đơn | P0 | |
| E2E-11 | Đổi thông tin cửa hàng | P1 | |
| E2E-12 | Thiết lập cửa hàng từ database trống | P1 | |

---

### E2E-01 — Mua hàng COD trọn vòng
1. **Khách (điện thoại)**: trang chủ → bấm danh mục C1 → mở P1 → chọn 500g, SL 2 → "Thêm vào giỏ hàng" → quay lại, bấm + nhanh trên thẻ P3.
2. Bấm icon giỏ: 2 dòng, tạm tính = 85.000×2 + 250.000 = **420.000 ₫**.
3. "Tiến hành thanh toán" → nhập tên, `0905 123 456`, địa chỉ, ghi chú → COD → "Đặt hàng".
4. ✅ Màn hình thành công có mã đơn `DH…`, tạm tính 420.000 ₫; giỏ trống. Ghi lại mã đơn.
5. **ADMIN**: trong ~2 giây có thông báo + âm báo "Đơn hàng mới {mã}"; menu "Đơn hàng" +1.
6. Mở đơn: đúng 2 dòng, SĐT `0905123456`, ghi chú khách. Nhập phí ship 25.000 → "Xác nhận đơn".
7. **Khách**: tra cứu bằng mã + `0905123456` → "Đã xác nhận", phí ship 25.000, tổng **445.000 ₫**.
8. **STAFF1**: mở đơn → "Bắt đầu đóng gói" → "Giao cho vận chuyển" (ghi chú "Giao lúc 15h") → "Đã giao thành công"; đổi thanh toán "Đã thanh toán".
9. **Khách**: tra cứu → thanh tiến trình đủ 5 bước, "Đã thanh toán".
10. **ADMIN**: lịch sử đơn có 5 dòng (đặt, xác nhận – ADMIN, đóng gói / giao / đã giao – STAFF1, ghi chú "Giao lúc 15h"); Tổng quan 7 ngày: doanh thu +445.000, P1 và P3 trong "Sản phẩm bán chạy".
11. Đơn đã giao: ô phí ship / giảm giá bị khoá.

### E2E-02 — Mua hàng chuyển khoản
1. Admin đã nhập "Thông tin chuyển khoản" (ngân hàng, STK, chủ TK).
2. Khách đặt 1 đơn chọn "Chuyển khoản ngân hàng".
3. ✅ Màn hình thành công hiện khung "Hướng dẫn chuyển khoản" đúng nội dung admin nhập, giữ xuống dòng.
4. Admin: đơn hiện phương thức "Chuyển khoản", thanh toán "Chưa thanh toán" → xác nhận → đổi "Đã thanh toán".
5. Khách tra cứu: "Chuyển khoản ngân hàng — Đã thanh toán".

### E2E-03 — Giá đổi khi khách đang thanh toán
1. Khách thêm P1 500g × 1, mở `/checkout`, điền dở form (chưa bấm đặt).
2. Admin sửa P1 500g giá 85.000 → 95.000 → Lưu.
3. ✅ Trong ~2 giây, checkout của khách hiện 95.000 ₫; chữ đã điền còn nguyên.
4. Khách đặt hàng → đơn ở admin có đơn giá **95.000** (không phải 85.000).

### E2E-04 — Hết hàng khi khách đang thanh toán
1. Khách có P1 500g và P1 1kg trong giỏ, đang ở `/checkout`.
2. Admin đặt P1 1kg "Hết hàng".
3. ✅ Checkout: dòng 1kg "Hết hàng", gạch ngang; khung đỏ; nút "Đặt hàng" khoá.
4. Khách bấm "Quay lại giỏ hàng" → xoá dòng 1kg → checkout → đặt được chỉ với 500g.
5. Lặp lại nhưng **tắt API realtime** (hoặc chặn `/events` trong DevTools) để checkout không tự cập nhật → bấm "Đặt hàng" → lỗi "Một số sản phẩm trong giỏ đã hết hàng…"; không có đơn.

### E2E-05 — Khách huỷ qua điện thoại
1. Khách đặt đơn. Admin xác nhận (phí ship 30.000).
2. Khách gọi huỷ: STAFF1 bấm "Huỷ đơn" → Cancel (không đổi) → bấm lại → OK, ghi chú "Khách đổi ý".
3. ✅ Khách tra cứu: "Đơn hàng đã bị huỷ."; admin: không còn nút xử lý; Tổng quan: không tính doanh thu, tăng "Đơn bị huỷ".

### E2E-06 — Báo giá sỉ
1. Khách mở P3 → "Gửi yêu cầu báo giá sỉ" → `/wholesale` thấy P3 trong danh sách nhận sỉ.
2. Gửi form: tên, quán "Cafe Mộc", SĐT, nhu cầu "Sầu riêng 20kg/tháng".
3. ✅ Admin: thông báo "Báo giá sỉ mới"; `/inquiries` lọc "Báo giá sỉ" thấy đủ thông tin; bấm SĐT gọi được.
4. STAFF1 "Đánh dấu: Đang xử lý" → "Đánh dấu: Xong"; số trên menu giảm.

### E2E-07 — Nhân viên nghỉ việc
1. STAFF2 đăng nhập trên 2 trình duyệt, đang mở `/orders`.
2. ADMIN bấm "Khoá" STAFF2.
3. ✅ Trong ≤ 60 giây cả 2 trình duyệt của STAFF2 về `/login` (hoặc ở thao tác kế tiếp); STAFF2 đăng nhập lại → "Tài khoản đã bị vô hiệu hoá…".
4. ADMIN xoá STAFF2 → lịch sử các đơn STAFF2 từng xử lý vẫn còn.
5. Gọi API bằng token cũ của STAFF2 → 401.

### E2E-08 — Ra mắt sản phẩm mới
1. ADMIN tạo sản phẩm "Chanh dây" (C2), 3 ảnh, 2 quy cách, nổi bật, ẩn ("Đang bán" tắt).
2. ✅ Web: không thấy ở danh sách, tìm kiếm, trang chủ; slug → 404.
3. Bật "Đang bán" ở danh sách sản phẩm.
4. ✅ Web đang mở trang chủ tự hiện sản phẩm ở khối nổi bật; tìm "chanh day" ra; trang chi tiết đúng ảnh, giá, giá/kg.
5. Tạo banner trỏ tới sản phẩm (chọn trong ô liên kết) → trang chủ có banner, bấm nút mở đúng sản phẩm.

### E2E-09 — Ngừng bán cả danh mục
1. Khách có P1 (C1) trong giỏ.
2. ADMIN bỏ "Hiển thị trên website" của C1.
3. ✅ Web: C1 mất khỏi menu, chip, trang chủ; P1, P3 biến mất; checkout của khách báo "Sản phẩm đã ngừng bán" ở P1.
4. ADMIN thử xoá C1 → bị từ chối kèm số sản phẩm. Bật lại C1 → mọi thứ trở lại.

### E2E-10 — Xoá sản phẩm đã có đơn
1. Đặt đơn có P2 (đặt P2 về "Còn hàng" trước). Ghi lại mã đơn.
2. ADMIN xoá P2.
3. ✅ Admin mở đơn cũ: dòng P2 vẫn đủ tên, quy cách, đơn giá, thành tiền. Khách tra cứu: như cũ. Tổng quan: doanh thu không đổi.
4. Khách khác có P2 trong giỏ → vào checkout → dòng P2 tự biến mất khỏi giỏ (xem [findings.md F-05](findings.md)).

### E2E-11 — Đổi thông tin cửa hàng
1. ADMIN đổi hotline, Zalo, địa chỉ, link bản đồ, Facebook, dải chữ chạy.
2. ✅ Web đang mở (không F5): dải chữ, footer, trang liên hệ, nút liên hệ nổi (Zalo, gọi, SMS, Messenger) đều dùng thông tin mới; bấm từng nút mở đúng đích.
3. STAFF1 không vào được `/settings`; gọi `PUT /admin/settings` bằng token STAFF1 → 403.

### E2E-12 — Thiết lập cửa hàng từ database trống
1. Xoá database dev (`npm run db:down`, xoá volume, `db:up`, `db:deploy`), `npm run admin:create`.
2. ✅ Web mở được ngay: thông tin cửa hàng mặc định, không có banner/danh mục/sản phẩm, không lỗi; checkout báo giỏ trống.
3. Admin đăng nhập → Tổng quan toàn số 0. Nhập theo thứ tự: Thông tin cửa hàng → Danh mục → Sản phẩm → Banner → Chính sách (dùng mẫu) → Bài viết.
4. ✅ Sau mỗi bước, web tương ứng hiện dữ liệu mới. Cuối cùng chạy E2E-01.
