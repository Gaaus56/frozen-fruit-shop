# 03. Cấu trúc website (Sitemap & Nội dung từng trang)

## 1. Sơ đồ điều hướng chính (menu)

```
Trang chủ
├── Sản phẩm
│   ├── Danh mục: Xoài đông lạnh
│   ├── Danh mục: Dâu đông lạnh
│   ├── Danh mục: Sầu riêng đông lạnh
│   ├── Danh mục: Bơ đông lạnh
│   ├── Danh mục: Mãng cầu đông lạnh
│   ├── Danh mục: Sapoche đông lạnh
│   └── [Trang chi tiết sản phẩm]
├── Giới thiệu
├── Đặt hàng sỉ / Đối tác F&B
├── Tin tức (Blog)
│   └── [Trang chi tiết bài viết]
├── Liên hệ
└── Tài khoản
    ├── Đăng nhập / Đăng ký
    ├── Quên mật khẩu
    ├── Đơn hàng của tôi
    ├── Địa chỉ đã lưu
    └── Danh sách yêu thích

Giỏ hàng → Checkout → Xác nhận đơn hàng

Footer (không nằm trong menu chính)
├── Hướng dẫn mua hàng
├── Chính sách bảo mật
├── Chính sách thanh toán
├── Chính sách vận chuyển
├── Chính sách đổi trả
├── Điều khoản dịch vụ
└── Tra cứu đơn hàng
```

## 2. Chi tiết nội dung từng trang

### 2.1. Trang chủ (`/`)
- Banner/slider: khuyến mãi, sản phẩm mới, thông điệp thương hiệu.
- Khối "Vì sao chọn Frozen Fruit Shop": 4 điểm nổi bật (chất lượng nguồn gốc rõ ràng, không chất bảo quản, đóng gói hút chân không giữ trọn dinh dưỡng, giao hàng lạnh toàn quốc).
- Danh mục sản phẩm dạng lưới (ảnh đại diện mỗi loại trái cây → link tới trang danh mục).
- Sản phẩm bán chạy/nổi bật (4-8 sản phẩm, có giá + nút thêm giỏ hàng nhanh).
- Băng chuyền đánh giá khách hàng (nếu có).
- Giới thiệu ngắn về công ty (2-3 câu) + nút "Tìm hiểu thêm" → trang Giới thiệu.
- 3 bài blog mới nhất (ảnh + tiêu đề + trích đoạn).
- Khối liên hệ nhanh: hotline, Zalo, email.

### 2.2. Trang danh sách sản phẩm (`/san-pham` hoặc `/san-pham/[danh-muc]`)
- Bộ lọc: loại trái cây, khoảng giá, quy cách đóng gói (250g/500g/1kg), tình trạng (còn hàng).
- Sắp xếp: giá tăng/giảm, mới nhất, bán chạy nhất.
- Lưới sản phẩm: ảnh, tên, giá (hiển thị giá theo biến thể mặc định), đánh giá sao, nút thêm giỏ hàng nhanh.
- Phân trang hoặc infinite scroll.

### 2.3. Trang chi tiết sản phẩm (`/san-pham/[slug]`)
- Gallery ảnh (nhiều góc, có thể có ảnh đóng gói thực tế).
- Tên sản phẩm, đánh giá sao, số lượng đã bán/đánh giá.
- Chọn biến thể quy cách đóng gói → cập nhật giá tương ứng.
- Giá/kg hiển thị kèm để dễ so sánh giữa các quy cách.
- Mô tả chi tiết: nguồn gốc, quy trình cấp đông, thành phần dinh dưỡng (nếu có).
- Khối "Bảo quản & Sử dụng": nhiệt độ bảo quản, hạn sử dụng, hướng dẫn rã đông/chế biến.
- Nút "Thêm vào giỏ" và "Mua ngay".
- Phần đánh giá của khách hàng (review + rating).
- Sản phẩm liên quan / thường mua kèm.

### 2.4. Giỏ hàng (`/gio-hang`)
- Danh sách sản phẩm trong giỏ: ảnh, tên, biến thể, số lượng (có thể chỉnh), đơn giá, thành tiền.
- Ô nhập mã giảm giá.
- Tạm tính, phí vận chuyển ước tính (theo khu vực nếu đã chọn), tổng cộng.
- Nút "Tiến hành thanh toán".

### 2.5. Checkout (`/thanh-toan`)
- Bước 1: Thông tin giao hàng (họ tên, SĐT, email, địa chỉ — chọn tỉnh/thành/quận/huyện, hệ thống kiểm tra khu vực có được giao hàng không).
- Bước 2: Phương thức vận chuyển (hiển thị phí + thời gian dự kiến).
- Bước 3: Phương thức thanh toán (COD, chuyển khoản, ví điện tử/cổng thanh toán).
- Bước 4: Xác nhận đơn hàng (tóm tắt toàn bộ thông tin trước khi đặt).
- Trang cảm ơn/xác nhận (`/dat-hang-thanh-cong`): mã đơn hàng, thông tin tóm tắt, link tra cứu đơn hàng.

### 2.6. Giới thiệu (`/gioi-thieu`)
- Câu chuyện thương hiệu, sứ mệnh.
- Tiêu chuẩn chất lượng (VietGAP, chứng nhận an toàn thực phẩm...).
- Quy trình cấp đông & đóng gói (hình ảnh/infographic minh họa chuỗi lạnh).
- Thông tin doanh nghiệp (nếu cần công khai: tên công ty, mã số thuế) để tạo niềm tin.
- Địa chỉ chi nhánh/kho (nếu có nhiều địa điểm).

### 2.7. Đặt hàng sỉ / Đối tác F&B (`/dat-hang-si`)
- Giới thiệu chính sách giá sỉ, lợi ích khi hợp tác lâu dài.
- Danh sách sản phẩm phù hợp mua sỉ (dạng sơ chế sẵn: gọt vỏ, cắt miếng).
- Form yêu cầu báo giá (tên công ty/cửa hàng, sản phẩm quan tâm, số lượng dự kiến, thông tin liên hệ).

### 2.8. Tin tức/Blog (`/tin-tuc`, `/tin-tuc/[slug]`)
- Danh sách bài viết: ảnh đại diện, tiêu đề, ngày đăng, trích đoạn, danh mục (mẹo bảo quản, công thức, so sánh sản phẩm...).
- Trang chi tiết bài viết: nội dung, ảnh minh họa, chia sẻ mạng xã hội, bài viết liên quan.

### 2.9. Liên hệ (`/lien-he`)
- Form liên hệ (họ tên, email/SĐT, nội dung).
- Thông tin hotline, email, Zalo, mạng xã hội.
- Bản đồ nhúng địa chỉ chi nhánh/kho.
- Giờ làm việc/hỗ trợ.

### 2.10. Tài khoản khách hàng (`/tai-khoan/*`)
- Đăng nhập/Đăng ký (`/tai-khoan/dang-nhap`, `/tai-khoan/dang-ky`).
- Quên mật khẩu (`/tai-khoan/quen-mat-khau`).
- Trang tổng quan tài khoản: thông tin cá nhân, đơn hàng gần đây.
- Đơn hàng của tôi (`/tai-khoan/don-hang`) — danh sách + chi tiết trạng thái từng đơn.
- Địa chỉ đã lưu (`/tai-khoan/dia-chi`).
- Danh sách yêu thích (`/tai-khoan/yeu-thich`).

### 2.11. Tra cứu đơn hàng (không cần đăng nhập) (`/tra-cuu-don-hang`)
- Nhập mã đơn hàng + số điện thoại/email → hiển thị trạng thái đơn.

### 2.12. Các trang chính sách (`/chinh-sach/*`)
- Hướng dẫn mua hàng.
- Chính sách bảo mật.
- Chính sách thanh toán.
- Chính sách vận chuyển (kèm danh sách khu vực giao hàng hỗ trợ).
- Chính sách đổi trả (lưu ý riêng cho hàng đông lạnh: điều kiện đổi trả khi hàng còn nguyên vẹn, chưa rã đông...).
- Điều khoản dịch vụ.

## 3. Ghi chú responsive & SEO

- Mọi trang thiết kế mobile-first, menu chính chuyển thành hamburger menu trên mobile.
- Mỗi trang có title, meta description riêng; trang sản phẩm/blog dùng dữ liệu có cấu trúc (Schema.org: Product, Article) để hỗ trợ rich snippet.
- URL thân thiện, không dấu, có dấu gạch ngang (ví dụ: `/san-pham/xoai-dong-lanh-500g`).
