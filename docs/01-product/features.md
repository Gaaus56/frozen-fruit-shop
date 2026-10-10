# Danh sách tính năng

Trạng thái: ✅ xong · 🟡 một phần · ⬜ chưa làm (đã lên kế hoạch). Mã ưu tiên (P0–P3) và thứ tự làm nằm ở [roadmap.md](../05-roadmap/roadmap.md).

## 1. Website khách hàng (`apps/web`)

### Xem sản phẩm
| Tính năng | Trạng thái | Ghi chú |
|---|:-:|---|
| Trang chủ: banner trình chiếu, giới thiệu, danh mục, sản phẩm nổi bật, bài viết mới | ✅ | Khối nào chưa có dữ liệu thì tự ẩn |
| Danh sách sản phẩm: lọc danh mục, tìm kiếm có/không dấu, sắp xếp | ✅ | `/products?category=&q=&sort=` |
| Chi tiết sản phẩm: thư viện ảnh, chọn quy cách, giá gốc / % giảm, giá/kg, tồn kho, bảo quản & rã đông, sản phẩm liên quan | ✅ | |
| Breadcrumb ở trang chi tiết sản phẩm, bài viết | ✅ | |
| Phân trang danh sách sản phẩm | ⬜ | Hiện hiển thị toàn bộ — đủ khi < ~100 sản phẩm |
| Đánh giá sao / review | ⬜ | Chưa cần ở quy mô hiện tại |

### Mua hàng
| Tính năng | Trạng thái | Ghi chú |
|---|:-:|---|
| Giỏ hàng lưu trên trình duyệt, sửa số lượng 1–99, xoá | ✅ | `localStorage` |
| Báo giá lại từ API: cập nhật giá, đánh dấu dòng hết hàng / ngừng bán | ✅ | Không tin giá phía trình duyệt |
| Đặt hàng không cần tài khoản (COD / chuyển khoản) | ✅ | Hiện mã đơn + hướng dẫn chuyển khoản sau khi đặt |
| Tra cứu đơn bằng mã đơn + SĐT | ✅ | |
| Email / Zalo xác nhận đơn cho khách | ⬜ | |
| Mã giảm giá | ⬜ | Hiện shop nhập giảm giá thủ công trên đơn |
| Thanh toán online (VNPay / MoMo / VietQR tự đối soát) | ⬜ | |

### Nội dung & liên hệ
| Tính năng | Trạng thái | Ghi chú |
|---|:-:|---|
| Giới thiệu, Liên hệ (bản đồ + form) | ✅ | Trang đặt hàng sỉ đã bỏ (2026-10) |
| Tin tức chia 2 loại **Kiến thức** / **Tuyển dụng** (tab lọc, hẹn giờ đăng); bài tuyển dụng có khối Ứng tuyển (Zalo, gọi, email) | ✅ | |
| Trang chính sách (đổi trả, vận chuyển…) | ✅ | Liệt kê ở chân trang |
| Nút liên hệ nổi: gọi, Zalo, Facebook | ✅ | |
| Tự cập nhật khi admin sửa dữ liệu (không mất giỏ hàng) | ✅ | SSE |
| Tiêu đề, mô tả, ảnh chia sẻ (Open Graph) riêng từng trang | ✅ | |
| `sitemap.xml`, `robots.txt` | ⬜ | Cần cho Google Search Console |
| Dữ liệu có cấu trúc (JSON-LD Product, Article, LocalBusiness) | ⬜ | |
| Gắn Google Analytics / đo chuyển đổi | ⬜ | |

## 2. Trang quản trị (`apps/admin`)

| Tính năng | Trạng thái | Ghi chú |
|---|:-:|---|
| Đăng nhập, phiên trong cookie httpOnly, tự đăng xuất khi hết hạn | ✅ | |
| Phân quyền ADMIN (1) / STAFF (nhiều) | ✅ | Kiểm tra ở API |
| Tổng quan: doanh thu, số đơn, biểu đồ, bán chạy, theo danh mục, tồn kho thấp | ✅ | Chỉ ADMIN |
| Đơn hàng: lọc, tìm, đổi trạng thái hợp lệ, thanh toán, phí ship, giảm giá, ghi chú, lịch sử, in phiếu | ✅ | |
| Liên hệ: trạng thái Mới / Đang xử lý / Xong | ✅ | Liên hệ báo giá sỉ cũ vẫn xem được |
| Sản phẩm: nhiều ảnh (kéo thứ tự), nhiều quy cách, bật/tắt nhanh | ✅ | |
| Danh mục, banner, bài viết, chính sách (có mẫu soạn sẵn) | ✅ | |
| Trình soạn thảo: tiêu đề, đậm/nghiêng, danh sách, trích dẫn, khung ghi chú, liên kết, **ảnh có chú thích ở bất cứ đâu** (dán / kéo-thả), **ô sản phẩm** | ✅ | Bài viết, chính sách, mô tả sản phẩm, trang Giới thiệu |
| Trang Giới thiệu sửa được | ✅ | |
| Thông tin cửa hàng (hotline, chuyển khoản, MST, dòng chữ chạy + bật/tắt…) | ✅ | Chỉ ADMIN |
| Tài khoản nhân viên: tạo, khoá, đặt lại mật khẩu, xoá | ✅ | Chỉ ADMIN |
| Thông báo realtime đơn / liên hệ mới (toast + âm báo + số trên tab) | ✅ | |
| Tải ảnh trực tiếp (kiểm tra định dạng thật, ≤ 5 MB) | ✅ | |
| OTP khi ADMIN đăng nhập | ⬜ | Đã thiết kế — [admin.md §5](../03-apps/admin.md#5-kế-hoạch-xác-thực-otp-cho-admin) |
| Tự nén / resize ảnh khi tải lên | ⬜ | Hiện `next/image` resize lúc hiển thị |
| Xuất đơn hàng ra Excel | ⬜ | |
| Nhật ký thao tác của nhân viên (ngoài lịch sử đơn) | ⬜ | |

## 3. Backend & hạ tầng

| Tính năng | Trạng thái | Ghi chú |
|---|:-:|---|
| REST API, validate đầu vào, lỗi tiếng Việt | ✅ | |
| Giới hạn tần suất theo IP, honeypot chống spam | ✅ | Bộ nhớ trong tiến trình |
| Migration Prisma, tạo ADMIN bằng lệnh | ✅ | |
| Docker Compose production + Caddy HTTPS | ✅ | |
| CI: lint + build khi mở PR vào `main` | ✅ | Chưa có test, chưa tự triển khai |
| Sao lưu database hằng đêm (giữ 14 bản trên VPS) | 🟡 | Chưa đẩy ra ngoài VPS, chưa diễn tập khôi phục |
| Theo dõi lỗi (Sentry), giám sát uptime, cảnh báo | ⬜ | |
| Test tự động (API e2e, luồng đặt hàng) | ⬜ | |
| Tự động triển khai (CD) | ⬜ | |

Đối chiếu đầy đủ theo 13 lớp của một hệ thống production: [production-readiness.md](../05-roadmap/production-readiness.md).
