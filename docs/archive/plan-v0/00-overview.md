# 00. Tổng quan dự án

## 1. Giới thiệu

**Tên dự án:** Frozen Fruit Shop — website bán trái cây đông lạnh, tập trung vào phía khách hàng (storefront).
**Mục tiêu:** Xây dựng một website bán hàng (không xây dựng hệ thống quản trị/admin riêng trong giai đoạn này) để khách hàng có thể xem sản phẩm trái cây đông lạnh, tìm hiểu thương hiệu, thêm vào giỏ hàng, thanh toán và nhận hỗ trợ — lấy cảm hứng từ website tham khảo [traicaydonglanh.com](https://traicaydonglanh.com/) (Lộc Phát Frozen Foods).

Kế hoạch này **chỉ tập trung vào phần khách hàng (storefront)**. Việc quản lý sản phẩm/tồn kho/đơn hàng được giả định thực hiện qua một nền tảng backend/CMS có sẵn (ví dụ headless CMS hoặc nền tảng thương mại điện tử dựng sẵn) thay vì xây một trang quản trị riêng — để giữ phạm vi tập trung vào trải nghiệm mua sắm.

## 2. Phân tích website tham khảo (traicaydonglanh.com)

Các điểm quan sát được và áp dụng cho kế hoạch này:

- **Menu điều hướng chính:** Trang chủ, Giới thiệu, Sản phẩm, Tuyển dụng, Tin tức/Blog, Liên hệ.
- **Danh mục sản phẩm:** một số nhóm trái cây đông lạnh (bơ, mãng cầu, sầu riêng, xoài, sapoche, dâu); mỗi sản phẩm hiển thị hình ảnh, tên, đánh giá sao, giá (VNĐ), nút "thêm vào giỏ".
- **Điểm nổi bật trang chủ:** chất lượng VietGAP, không chất bảo quản, đóng gói hút chân không, giao hàng nhanh toàn quốc.
- **Phần giới thiệu công ty:** thông tin đăng ký kinh doanh, sứ mệnh, thị trường xuất khẩu — tạo niềm tin.
- **Hệ thống phân phối:** hiển thị địa chỉ chi nhánh vật lý dù bán hàng chủ yếu online, giúp tăng độ tin cậy.
- **Blog:** khoảng 8 bài viết về cách bảo quản, công thức nấu ăn, so sánh giống loại, so sánh trái cây tươi vs đông lạnh — hỗ trợ SEO và giáo dục khách hàng.
- **Kênh hỗ trợ:** email, hotline, Zalo chat, mạng xã hội, cùng các trang chính sách (hướng dẫn mua hàng, bảo mật, thanh toán, vận chuyển, đổi trả, điều khoản).
- **Điểm bán hàng đặc biệt:** trái cây sơ chế sẵn (rửa sạch, gọt vỏ, cắt miếng) nhắm tới cả hộ gia đình và khách hàng F&B (quán cà phê, nhà hàng).

## 3. Đối tượng người dùng

| Vai trò | Mô tả |
|---|---|
| Khách vãng lai (Guest) | Duyệt sản phẩm, đọc nội dung, có thể thêm vào giỏ và đặt hàng mà không cần tài khoản |
| Khách hàng đã đăng ký | Có tài khoản, lưu địa chỉ, lịch sử đơn hàng, danh sách yêu thích |
| Khách mua lẻ (B2C) | Mua gói nhỏ (250g–1kg) dùng cho gia đình |
| Khách mua sỉ/F&B (B2B) | Mua số lượng lớn, quan tâm sản phẩm sơ chế sẵn (gọt/cắt sẵn) và nguồn cung ổn định |

## 4. Mục tiêu kinh doanh

- Giúp khách hàng dễ dàng tìm và mua trái cây đông lạnh online với luồng giỏ hàng → thanh toán → theo dõi đơn mượt mà.
- Xây dựng niềm tin về chất lượng chuỗi lạnh (tiêu chuẩn nguồn gốc, đóng gói hút chân không, không chất bảo quản).
- Giáo dục khách hàng (bảo quản, rã đông, công thức nấu ăn) để tăng tỷ lệ chuyển đổi và mua lại.
- Hỗ trợ cả khách lẻ và khách B2B/F&B nhẹ nhàng trong cùng một website ở giai đoạn v1, không cần xây cổng B2B riêng.

## 5. Phạm vi bộ tài liệu

Các file trong `docs/plan/`:

1. `00-overview.md` — tài liệu này.
2. `01-scope-and-features.md` — phạm vi chức năng, hành trình khách hàng, phân chia MVP và các giai đoạn sau.
3. `02-tech-stack.md` — công cụ và công nghệ cho frontend, nền tảng thương mại/backend, hosting, dịch vụ bên thứ ba.
4. `03-site-structure.md` — sơ đồ trang (sitemap), kế hoạch nội dung từng trang, điều hướng.
5. `04-data-model.md` — mô hình dữ liệu/nội dung (sản phẩm, danh mục, đơn hàng, khách hàng) ở mức cần thiết cho frontend.
6. `05-roadmap.md` — lộ trình triển khai theo giai đoạn.
7. `06-deployment-and-operations.md` — hosting, CI/CD, giám sát, SEO, và các lưu ý vận hành đặc thù hàng đông lạnh cần thể hiện trên website (vd. thông báo khu vực giao hàng).
8. `07-admin-panel.md` — trang quản trị để chủ cửa hàng tự cập nhật sản phẩm/danh mục/bài viết (bổ sung sau khi quyết định tự xây backend thay vì dùng nền tảng thương mại có sẵn).
9. `08-progress-checklist.md` — checklist tiến độ ngắn gọn, cập nhật khi có thay đổi lớn.

## 6. Ràng buộc đặc thù ngành hàng đông lạnh

- **Thông tin chuỗi lạnh:** mỗi trang sản phẩm phải nêu rõ nhiệt độ bảo quản, hạn sử dụng, hướng dẫn rã đông.
- **Đóng gói & vận chuyển:** đóng gói cách nhiệt (thùng xốp + đá gel) ảnh hưởng đến chi phí/thời gian giao hàng; website cần thể hiện rõ khu vực giao hàng và giờ chốt đơn (cut-off time).
- **Giới hạn khu vực giao hàng:** giai đoạn đầu có thể chỉ giao ở một số tỉnh/thành; bước checkout cần kiểm tra điều này trước khi thanh toán.
- **Đơn vị bán hàng:** sản phẩm bán theo trọng lượng/gói (250g/500g/1kg); trang sản phẩm cần cho chọn biến thể theo quy cách đóng gói.
- **Nhu cầu B2B:** một số khách muốn giá sỉ/số lượng lớn — cần có đường dẫn đơn giản "liên hệ đặt sỉ" ngay từ v1, chưa cần xây cổng B2B đầy đủ.

## 7. Tiêu chí thành công (định tính)

- Khách hàng có thể đi từ trang chủ → sản phẩm → giỏ hàng → thanh toán → xác nhận đơn hàng một cách mượt mà, trên cả desktop và mobile.
- Trang chủ và trang sản phẩm tải trong khoảng 2-3 giây trên kết nối trung bình.
- Nội dung tạo niềm tin (giới thiệu, chứng nhận, chính sách bảo quản/vận chuyển) dễ tìm thấy từ bất kỳ trang nào.
- Trang blog/nội dung hỗ trợ SEO cơ bản (thẻ meta, URL dễ đọc, nội dung có cấu trúc rõ ràng).
