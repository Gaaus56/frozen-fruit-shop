# 06. Triển khai & Vận hành (Deployment & Operations)

## 1. Môi trường

| Môi trường | Mục đích | Hạ tầng |
|---|---|---|
| Local (dev) | Phát triển hàng ngày | Next.js dev server, kết nối tới môi trường test của commerce platform |
| Preview | Xem trước mỗi Pull Request | Vercel Preview Deployments (tự động theo PR) |
| Staging | Kiểm thử trước khi phát hành | Vercel (nhánh `staging`), kết nối dữ liệu test |
| Production | Website chính thức | Vercel (nhánh `main`), kết nối dữ liệu thật |

## 2. Quy trình CI/CD

1. Push code / mở Pull Request → GitHub Actions chạy: lint (ESLint), type-check (TypeScript), unit test (Vitest/Jest).
2. Vercel tự động tạo Preview Deployment cho PR để review trực quan.
3. Merge vào `main` → tự động build & deploy lên Production.
4. Chạy smoke test cơ bản sau deploy (kiểm tra trang chủ, trang sản phẩm, checkout load thành công).

## 3. Giám sát & cảnh báo (Monitoring)

- **Uptime monitoring:** UptimeRobot hoặc Vercel's built-in monitoring — cảnh báo khi site down.
- **Lỗi runtime frontend:** Sentry — theo dõi lỗi JavaScript phía client, đặc biệt ở luồng checkout.
- **Hiệu suất:** Vercel Analytics / Google PageSpeed Insights — theo dõi Core Web Vitals (LCP, CLS, INP).
- **Đơn hàng thất bại:** cảnh báo khi tỷ lệ lỗi thanh toán tăng bất thường (qua log của cổng thanh toán).

## 4. Bảo mật

- HTTPS bắt buộc toàn site (mặc định qua Vercel/Cloudflare).
- Không lưu trữ thông tin thẻ thanh toán trên hệ thống của mình — toàn bộ xử lý qua cổng thanh toán (PCI-DSS compliance do bên thứ ba đảm nhiệm).
- Xác thực khách hàng: dùng cơ chế auth có sẵn của commerce platform (tránh tự xây hệ thống mật khẩu).
- Chống spam form (liên hệ, đặt hàng sỉ): dùng reCAPTCHA hoặc honeypot field.
- Rate limiting cho API tìm kiếm/checkout để tránh lạm dụng.
- Biến môi trường (API keys, secrets) lưu trong Vercel Environment Variables, không commit vào repo.

## 5. Sao lưu & khôi phục

- Dữ liệu sản phẩm/đơn hàng/khách hàng được lưu trên nền tảng commerce đã chọn — tận dụng cơ chế backup có sẵn của nền tảng đó (ví dụ Shopify tự backup dữ liệu).
- Nội dung CMS (blog, trang tĩnh): xuất bản định kỳ hoặc dùng CMS có versioning (Sanity hỗ trợ lịch sử chỉnh sửa).
- Mã nguồn: lưu trên GitHub, có lịch sử commit đầy đủ.

## 6. SEO & hiệu suất khi vận hành

- Cập nhật `sitemap.xml` tự động mỗi khi thêm sản phẩm/bài viết mới.
- Theo dõi Google Search Console định kỳ để phát hiện lỗi index, lỗi crawl.
- Tối ưu ảnh sản phẩm (định dạng WebP/AVIF, lazy loading).
- Cache trang tĩnh (danh mục, blog) qua ISR (Incremental Static Regeneration) của Next.js để vừa nhanh vừa cập nhật dữ liệu mới.

## 7. Vận hành đặc thù hàng đông lạnh (nội dung cần thể hiện trên site, không phải quy trình nội bộ)

- Trang chính sách vận chuyển cần liệt kê rõ và cập nhật kịp thời **danh sách khu vực đang hỗ trợ giao hàng** — vì đây là dữ liệu có thể thay đổi khi mở rộng vùng phục vụ.
- Hiển thị rõ **giờ chốt đơn trong ngày** (cut-off time) để đảm bảo đơn được xử lý và giao trong ngày/hôm sau, tránh trường hợp hàng đông lạnh giữ quá lâu trước khi giao.
- Có cơ chế thông báo tạm ngưng nhận đơn ở khu vực xa vào các đợt thời tiết cực đoan/lễ Tết nếu ảnh hưởng chuỗi lạnh (thông báo dạng banner trên trang chủ/checkout).

## 8. Checklist trước khi ra mắt (go-live)

- [ ] Toàn bộ luồng mua hàng (duyệt → giỏ hàng → thanh toán → xác nhận) test thành công trên Chrome, Safari, mobile.
- [ ] Thanh toán COD và ít nhất 1 cổng thanh toán online hoạt động đúng.
- [ ] Trang chính sách vận chuyển/đổi trả đã có nội dung đầy đủ, chính xác.
- [ ] Kiểm tra khu vực giao hàng hoạt động đúng ở bước checkout.
- [ ] Domain + HTTPS đã cấu hình đúng.
- [ ] Google Analytics/Tag Manager đã gắn.
- [ ] Sitemap.xml, robots.txt đã có.
- [ ] Kênh hỗ trợ (hotline/Zalo/email) hiển thị đúng, đã test nhận được liên hệ thử.
- [ ] Sao lưu/khôi phục dữ liệu đã được xác nhận hoạt động (theo cơ chế của nền tảng commerce).
