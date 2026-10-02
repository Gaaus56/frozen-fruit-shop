# 05. Lộ trình triển khai (Roadmap)

> Các mốc thời gian mang tính tham khảo, giả định một đội nhỏ (1-3 người) làm việc bán thời gian/toàn thời gian. Cần điều chỉnh theo nguồn lực thực tế.

## Giai đoạn 0 — Chuẩn bị (tuần 1)
- Chốt lựa chọn nền tảng commerce (Shopify/Medusa/WooCommerce) — xem `02-tech-stack.md`.
- Thiết lập repo, cấu trúc dự án Next.js, CI/CD cơ bản.
- Thiết kế UI/UX (wireframe → mockup) cho các trang chính: trang chủ, danh mục, chi tiết sản phẩm, giỏ hàng, checkout.
- Chuẩn bị nội dung ban đầu: danh sách sản phẩm, ảnh, thông tin bảo quản, nội dung trang Giới thiệu.

## Giai đoạn 1 — MVP (tuần 2-6)
**Mục tiêu:** website có thể bán hàng thực tế, khách hoàn tất được luồng mua hàng cơ bản.

- Tuần 2-3: Xây trang chủ, trang danh mục, trang chi tiết sản phẩm (kết nối dữ liệu từ commerce platform qua Storefront API).
- Tuần 3-4: Xây giỏ hàng, checkout (COD + 1 phương thức thanh toán online), trang xác nhận đơn hàng.
- Tuần 4-5: Xây trang Giới thiệu, Liên hệ, các trang chính sách; tích hợp validate khu vực giao hàng.
- Tuần 5: Tra cứu đơn hàng không cần tài khoản.
- Tuần 6: Kiểm thử toàn bộ luồng mua hàng (QA), tối ưu tốc độ tải trang, responsive mobile, SEO cơ bản (meta tags, sitemap.xml).
- **Deliverable:** website public, có thể nhận đơn hàng thật.

## Giai đoạn 2 — Mở rộng trải nghiệm khách hàng (tuần 7-12)
- Tài khoản khách hàng đầy đủ: đăng ký/đăng nhập, lịch sử đơn hàng, địa chỉ đã lưu, wishlist.
- Trang Blog/Tin tức (tích hợp CMS nội dung), viết 8-10 bài đầu tiên (bảo quản, công thức, so sánh sản phẩm).
- Mã giảm giá/voucher trong giỏ hàng & checkout.
- Đánh giá sản phẩm (review) từ khách hàng đã mua.
- Trang Đặt hàng sỉ/F&B + form yêu cầu báo giá.
- **Deliverable:** website đầy đủ tính năng như bản tham khảo, có nội dung SEO.

## Giai đoạn 3 — Tối ưu & mở rộng (sau tuần 12, liên tục)
- Chương trình khách hàng thân thiết/tích điểm.
- Đăng nhập mạng xã hội.
- Trang Tuyển dụng.
- Cá nhân hóa gợi ý sản phẩm (dựa trên lịch sử xem/mua).
- Đa ngôn ngữ nếu mở rộng khách nước ngoài/xuất khẩu.
- Tối ưu chuyển đổi liên tục: A/B testing trang sản phẩm/checkout, cải thiện tốc độ, mở rộng khu vực giao hàng.

## Ghi chú ưu tiên

Nếu cần rút gọn để ra mắt sớm nhất, thứ tự ưu tiên tuyệt đối cho MVP là:
1. Trang chủ + danh mục + chi tiết sản phẩm (khách phải xem được sản phẩm).
2. Giỏ hàng + checkout hoạt động được (khách phải đặt được hàng).
3. Trang chính sách vận chuyển/đổi trả (bắt buộc về mặt niềm tin & pháp lý cho hàng đông lạnh).
4. Trang Liên hệ + kênh hỗ trợ (khách cần có cách hỏi khi có vấn đề).

Các mục còn lại (tài khoản, blog, đánh giá, voucher...) có thể triển khai sau khi website đã "sống" và nhận đơn hàng thật.
