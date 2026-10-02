# 01. Phạm vi & Tính năng

## 1. Nguyên tắc phạm vi

Website tập trung 100% vào trải nghiệm khách hàng (storefront). Không xây dựng:
- Trang quản trị (admin dashboard) tùy chỉnh.
- Hệ thống quản lý kho/nhân sự nội bộ.

Việc nhập liệu sản phẩm/giá/tồn kho được thực hiện qua công cụ có sẵn (CMS/nền tảng thương mại điện tử được chọn ở `02-tech-stack.md`), storefront chỉ đọc dữ liệu và xử lý hành trình mua hàng.

## 2. Hành trình khách hàng chính (customer journeys)

### 2.1. Khám phá & tìm hiểu sản phẩm
1. Khách vào trang chủ, thấy các điểm nổi bật (chất lượng, đóng gói, giao hàng nhanh).
2. Khách duyệt danh mục sản phẩm (theo loại trái cây) hoặc dùng tìm kiếm.
3. Khách xem trang chi tiết sản phẩm: hình ảnh, mô tả, giá theo quy cách đóng gói, thông tin bảo quản/rã đông, đánh giá.

### 2.2. Mua hàng
1. Khách chọn quy cách đóng gói và số lượng, thêm vào giỏ hàng.
2. Khách xem giỏ hàng, điều chỉnh số lượng, áp mã giảm giá (nếu có).
3. Khách tiến hành checkout: nhập thông tin giao hàng, chọn khu vực (hệ thống kiểm tra khu vực có hỗ trợ giao hàng không), chọn phương thức thanh toán.
4. Khách xác nhận đơn hàng, nhận email/thông báo xác nhận.

### 2.3. Sau mua hàng
1. Khách theo dõi trạng thái đơn hàng (qua tài khoản hoặc tra cứu bằng mã đơn + số điện thoại).
2. Khách xem lại lịch sử đơn hàng (nếu có tài khoản).
3. Khách liên hệ hỗ trợ (chat/Zalo/hotline) nếu có vấn đề.

### 2.4. Khách hàng B2B/F&B
1. Khách xem trang "Đặt hàng sỉ/Đối tác F&B" giới thiệu chính sách giá sỉ.
2. Khách điền form liên hệ hoặc chat trực tiếp để được tư vấn báo giá, không xử lý qua giỏ hàng tiêu chuẩn.

## 3. Danh sách tính năng theo module

### 3.1. Trang chủ
- Banner/slider giới thiệu chương trình khuyến mãi, sản phẩm nổi bật.
- Khối "Vì sao chọn chúng tôi" (VietGAP, không chất bảo quản, hút chân không, giao hàng nhanh).
- Danh mục sản phẩm nổi bật (dạng lưới, có ảnh + link).
- Sản phẩm bán chạy / mới nhất.
- Khối giới thiệu ngắn về công ty + link "Xem thêm" tới trang Giới thiệu.
- Trích dẫn bài blog mới nhất.
- Form đăng ký nhận tin (email) — tùy chọn.

### 3.2. Danh mục & sản phẩm
- Trang danh sách sản phẩm theo danh mục, có bộ lọc (loại trái cây, khoảng giá, quy cách đóng gói) và sắp xếp (giá, mới nhất, bán chạy).
- Trang chi tiết sản phẩm:
  - Gallery ảnh sản phẩm.
  - Chọn biến thể (quy cách đóng gói: 250g/500g/1kg).
  - Giá theo biến thể, hiển thị giá/kg để dễ so sánh.
  - Mô tả sản phẩm, thông tin dinh dưỡng (nếu có).
  - Thông tin bảo quản: nhiệt độ, hạn sử dụng, hướng dẫn rã đông/chế biến.
  - Đánh giá & xếp hạng sao từ khách hàng.
  - Sản phẩm liên quan / gợi ý mua kèm.
  - Nút thêm vào giỏ hàng, mua ngay.

### 3.3. Giỏ hàng & Thanh toán
- Giỏ hàng: xem/sửa số lượng, xóa sản phẩm, tính tạm tính, phí vận chuyển ước tính, tổng cộng.
- Áp dụng mã giảm giá/voucher.
- Checkout:
  - Nhập/chọn địa chỉ giao hàng (tích hợp kiểm tra khu vực giao hàng hỗ trợ).
  - Chọn phương thức thanh toán (COD, chuyển khoản, ví điện tử/cổng thanh toán online).
  - Hiển thị thời gian giao hàng dự kiến theo khu vực.
  - Xác nhận đơn hàng + trang cảm ơn (order confirmation).
- Gửi email/SMS xác nhận đơn hàng.

### 3.4. Tài khoản khách hàng
- Đăng ký/đăng nhập (email hoặc số điện thoại), quên mật khẩu.
- Đăng nhập nhanh qua mạng xã hội (tùy chọn, giai đoạn sau).
- Quản lý địa chỉ giao hàng đã lưu.
- Lịch sử đơn hàng & trạng thái (đang xử lý, đang giao, đã giao, đã hủy).
- Danh sách yêu thích (wishlist).
- Tra cứu đơn hàng không cần đăng nhập (bằng mã đơn + SĐT/email).

### 3.5. Nội dung & thương hiệu
- Trang Giới thiệu (câu chuyện thương hiệu, tiêu chuẩn chất lượng, chứng nhận, quy trình cấp đông).
- Trang Blog/Tin tức: danh sách bài viết, trang chi tiết bài viết, chia sẻ mạng xã hội.
- Trang Tuyển dụng (danh sách vị trí, form ứng tuyển đơn giản) — tùy chọn giai đoạn sau.
- Trang Liên hệ: form liên hệ, bản đồ chi nhánh, thông tin hotline/email/Zalo.
- Trang Đặt hàng sỉ/F&B: giới thiệu chính sách sỉ, form yêu cầu báo giá.

### 3.6. Trang chính sách
- Hướng dẫn mua hàng.
- Chính sách bảo mật.
- Chính sách thanh toán.
- Chính sách vận chuyển & khu vực giao hàng.
- Chính sách đổi trả (đặc biệt lưu ý với hàng đông lạnh).
- Điều khoản dịch vụ.

### 3.7. Tìm kiếm & điều hướng
- Thanh tìm kiếm sản phẩm (gợi ý theo thời gian thực).
- Breadcrumb điều hướng.
- Footer với sitemap rút gọn, thông tin liên hệ, mạng xã hội.

## 4. Phân chia giai đoạn (MVP vs mở rộng)

### MVP (v1)
- Trang chủ, danh mục sản phẩm, chi tiết sản phẩm.
- Giỏ hàng, checkout (COD + 1 cổng thanh toán online cơ bản), trang cảm ơn.
- Trang Giới thiệu, Liên hệ, các trang chính sách.
- Tra cứu đơn hàng bằng mã đơn (không bắt buộc tài khoản).
- Responsive mobile-first.
- SEO cơ bản (meta tags, sitemap.xml, robots.txt).

### Giai đoạn 2
- Tài khoản khách hàng đầy đủ (đăng ký/đăng nhập, lịch sử đơn hàng, wishlist).
- Blog/Tin tức.
- Mã giảm giá/voucher.
- Đánh giá sản phẩm (review) từ khách hàng đã mua.
- Trang Đặt hàng sỉ/F&B.

### Giai đoạn 3
- Chương trình khách hàng thân thiết/tích điểm.
- Đăng nhập mạng xã hội.
- Trang Tuyển dụng.
- Đa ngôn ngữ (nếu mở rộng thị trường xuất khẩu/khách nước ngoài).
- Cá nhân hóa gợi ý sản phẩm.
