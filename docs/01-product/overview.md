# Tổng quan dự án

## 1. Bối cảnh

**Trái Cây Đông Lạnh Đà Nẵng 28** là hộ kinh doanh bán trái cây đông lạnh tại 49 Đặng Tất, Hoà Khánh, Đà Nẵng (chợ đầu mối Hoà Khánh). Trước đây bán chủ yếu qua Zalo, Facebook, điện thoại. Website giúp:

- Khách **tự xem sản phẩm, giá theo quy cách và đặt hàng** 24/7, không cần nhắn tin hỏi giá.
- Chủ shop **tự cập nhật** sản phẩm, giá, tồn kho, banner, bài viết mà không cần lập trình viên.
- Chủ shop và nhân viên **xử lý đơn tập trung** một chỗ, có lịch sử, có thống kê doanh thu.

Thông tin doanh nghiệp gốc: [business-info.md](business-info.md).

## 2. Người dùng

| Nhóm | Mô tả | Dùng app |
|---|---|---|
| Khách lẻ (B2C) | Hộ gia đình mua gói 250 g – 1 kg; đặt hàng **không cần tài khoản** | `apps/web` |
| Chủ cửa hàng (ADMIN) | Đúng 1 tài khoản; toàn quyền, xem doanh thu, quản lý nhân viên | `apps/admin` |
| Nhân viên (STAFF) | Xử lý đơn, liên hệ, cập nhật sản phẩm & nội dung; không xem doanh thu | `apps/admin` |

## 3. Mục tiêu

| Mục tiêu | Đo bằng |
|---|---|
| Khách đặt được hàng trơn tru trên điện thoại | Đi hết *trang chủ → sản phẩm → giỏ → đặt hàng → tra cứu* không lỗi, không cần hỏi shop |
| Tạo niềm tin về chuỗi lạnh | Mỗi sản phẩm có nhiệt độ bảo quản, hạn dùng, hướng dẫn rã đông; chính sách đổi trả rõ ràng |
| Shop tự vận hành | Mọi nội dung hiển thị trên web đều sửa được ở trang quản trị, thay đổi hiện ngay |
| Không bỏ lỡ đơn | Đơn / liên hệ mới báo ngay trên trang quản trị (âm báo + thông báo) |
| Trang nhanh, tìm được trên Google | Trang chủ / sản phẩm tải < 3 giây trên 4G; mỗi trang có tiêu đề, mô tả riêng |

## 4. Đặc thù ngành hàng đông lạnh

Những ràng buộc này chi phối thiết kế dữ liệu và luồng đặt hàng:

- **Bán theo quy cách đóng gói** (250 g / 500 g / 1 kg…): mỗi sản phẩm có nhiều *quy cách*, mỗi quy cách có giá, giá gốc, tồn kho riêng; hiển thị thêm **giá quy đổi/kg** để so sánh.
- **Thông tin chuỗi lạnh bắt buộc**: nhiệt độ bảo quản (−18 °C), hạn dùng, cách rã đông.
- **Phí ship không tính tự động**: hàng cần thùng xốp + đá gel, phí phụ thuộc khoảng cách → shop **gọi khách xác nhận** rồi nhập phí ở trang quản trị. Đơn mới có phí ship = 0.
- **Đổi trả có điều kiện**: bắt buộc video mở thùng; nội thành đổi trong 1–3 giờ, ngoại tỉnh cấp đông lại 24 giờ rồi gửi về.
- **Thanh toán**: chỉ COD — thu tiền khi giao (đã bỏ chuyển khoản 13/10/2026). Chưa có cổng thanh toán online.

## 5. Phạm vi

**Trong phạm vi hiện tại:** website khách hàng, trang quản trị, API, database, triển khai VPS — chi tiết ở [features.md](features.md).

**Ngoài phạm vi (có chủ đích):**
- Bán sỉ / báo giá sỉ cho quán, nhà hàng — đã bỏ khỏi website (2026-10); khách sỉ liên hệ trực tiếp qua hotline / Zalo.
- Tài khoản khách hàng, wishlist, tích điểm — khách mua lẻ không muốn đăng ký; tra cứu đơn bằng *mã đơn + SĐT* là đủ.
- Tự tính phí vận chuyển qua GHN/GHTK — đơn chủ yếu nội thành Đà Nẵng, shop tự giao.
- Kế toán, kho nhiều chi nhánh.

Các hạng mục có thể làm sau nằm trong [roadmap.md](../05-roadmap/roadmap.md).

## 6. Thuật ngữ

| Thuật ngữ | Nghĩa |
|---|---|
| Quy cách (variant) | Một cách đóng gói của sản phẩm, ví dụ "Xoài cắt miếng – 500g" |
| Bản chụp (snapshot) | Tên, quy cách, đơn giá lưu cứng vào dòng đơn lúc đặt; sửa / xoá sản phẩm sau đó không ảnh hưởng đơn cũ |
| Báo giá (quote) | API tính lại giá giỏ hàng từ database trước khi hiển thị / đặt hàng |
| Liên hệ (inquiry) | Tin nhắn từ form liên hệ (loại "báo giá sỉ" chỉ còn ở dữ liệu cũ) |
| Revalidate | API báo web xoá cache để trang hiển thị dữ liệu mới ngay |
| SSE | Server-Sent Events — kênh máy chủ đẩy sự kiện realtime xuống trình duyệt |
