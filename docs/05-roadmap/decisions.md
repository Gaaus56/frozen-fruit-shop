# Quyết định kỹ thuật

Ghi lại **vì sao** hệ thống được làm như hiện tại, để người sau không phải đoán và không vô tình đảo ngược. Mỗi mục: bối cảnh → quyết định → hệ quả. Thêm mục mới ở cuối, không sửa mục cũ — nếu đổi ý, thêm mục mới ghi "thay thế #n".

| # | Quyết định | Trạng thái |
|---|---|---|
| 1 | Tự xây backend thay vì Shopify / headless commerce | Đang áp dụng |
| 2 | Monorepo npm workspaces + `packages/types` | Đang áp dụng |
| 3 | NestJS + Prisma + PostgreSQL | Đang áp dụng |
| 4 | Admin là app Next.js riêng, gọi API từ server | Đang áp dụng |
| 5 | Không có tài khoản khách hàng | Đang áp dụng |
| 6 | Phí vận chuyển nhập tay sau khi gọi khách | Đang áp dụng |
| 7 | Cache Next.js + xoá theo tag thay vì render động mọi request | Đang áp dụng |
| 8 | Realtime bằng SSE thay vì WebSocket | Đang áp dụng |
| 9 | 1 VPS + Docker Compose + Caddy thay vì Vercel + PaaS | Đang áp dụng |
| 10 | Ảnh lưu trên đĩa API, DB chỉ lưu đường dẫn tương đối | Đang áp dụng |
| 11 | Không có dữ liệu mẫu (seed) | Đang áp dụng |
| 12 | Một ADMIN duy nhất + nhiều STAFF | Đang áp dụng |
| 13 | Bỏ chế độ tối (dark mode) ở web | Đang áp dụng |

---

### 1. Tự xây backend
- **Bối cảnh:** kế hoạch ban đầu ([archive](../archive/plan-v0/02-tech-stack.md)) định dùng nền tảng có sẵn. Nhưng nghiệp vụ đặc thù (quy cách đóng gói, phí ship thủ công, báo giá sỉ, tiếng Việt), chi phí thuê bao và cổng thanh toán VN không hợp.
- **Quyết định:** tự xây API + admin.
- **Hệ quả:** chủ động hoàn toàn dữ liệu và luồng; đổi lại phải tự lo bảo mật, sao lưu, vận hành.

### 2. Monorepo npm workspaces
- **Quyết định:** một repo, ba app, một package type chung; không dùng Turborepo/Nx.
- **Hệ quả:** sửa type API một chỗ → TypeScript báo lỗi ở web/admin. Đủ đơn giản cho đội nhỏ.

### 3. NestJS + Prisma + PostgreSQL
- **Quyết định:** NestJS cho cấu trúc module rõ; Prisma cho schema + migration type-safe; PostgreSQL cho dữ liệu quan hệ (sản phẩm – quy cách – đơn).
- **Hệ quả:** `schema.prisma` là nguồn sự thật của cấu trúc dữ liệu.

### 4. Admin là app riêng, gọi API từ server
- **Quyết định:** `apps/admin` tách khỏi web, chạy ở subdomain riêng; trang là Server Component, thao tác ghi là Server Action; token nằm trong cookie httpOnly.
- **Hệ quả:** trình duyệt không bao giờ thấy token; nhưng mọi request admin đến API cùng một IP (ảnh hưởng rate limit đăng nhập).

### 5. Không có tài khoản khách
- **Bối cảnh:** khách lẻ mua trái cây ngại đăng ký.
- **Quyết định:** đặt hàng chỉ cần tên + SĐT + địa chỉ; tra cứu bằng mã đơn + SĐT.
- **Hệ quả:** không có lịch sử mua / wishlist. Xem lại khi có tín hiệu ở [roadmap G4](roadmap.md#g4--mở-rộng-chỉ-làm-khi-có-nhu-cầu-thật).

### 6. Phí ship nhập tay
- **Bối cảnh:** hàng đông lạnh cần đóng thùng giữ lạnh, phí phụ thuộc khoảng cách và số lượng; shop tự giao nội thành.
- **Quyết định:** đơn mới có phí ship 0; shop gọi khách xác nhận rồi nhập phí.
- **Hệ quả:** khách chưa thấy tổng cuối khi đặt; khắc phục một phần ở [roadmap 3.4](roadmap.md#g3--tăng-trưởng-tháng-24).

### 7. Cache Next.js + xoá theo tag
- **Quyết định:** web cache dữ liệu 5 phút với tag `catalog` / `content` / `settings`; API gọi `/api/revalidate` khi dữ liệu đổi.
- **Hệ quả:** trang nhanh, API ít tải; vẫn cập nhật gần như tức thì. Nếu revalidate lỗi, chậm nhất 5 phút dữ liệu mới hiện.

### 8. Realtime bằng SSE
- **Quyết định:** Server-Sent Events (một chiều, tự kết nối lại, chạy qua HTTP thường); không dùng WebSocket / dịch vụ ngoài.
- **Hệ quả:** không cần thư viện; chỉ chạy được 1 instance API cho tới khi thêm Redis pub/sub.

### 9. 1 VPS + Docker Compose + Caddy
- **Bối cảnh:** API cần chạy liên tục (SSE, upload, cron sao lưu); Vercel + PaaS + DB managed tốn nhiều khoản phí nhỏ.
- **Quyết định:** một VPS, 5 container, Caddy tự cấp HTTPS.
- **Hệ quả:** chi phí thấp, dễ hiểu; đổi lại tự lo sao lưu, giám sát, bảo mật máy chủ ([production-readiness.md](production-readiness.md)).

### 10. Ảnh trên đĩa API
- **Quyết định:** lưu `uploads/yyyy/mm/<ngẫu nhiên>`, DB lưu đường dẫn tương đối, API ghép `PUBLIC_URL`.
- **Hệ quả:** đổi tên miền không cần sửa dữ liệu; phải sao lưu volume ảnh riêng. Chuyển sang object storage chỉ cần đổi lớp lưu + URL.

### 11. Không có seed
- **Quyết định:** database khởi tạo rỗng, chỉ tạo ADMIN bằng lệnh.
- **Hệ quả:** không bao giờ lẫn dữ liệu giả lên production; máy dev phải tự nhập vài sản phẩm để thử.

### 12. Một ADMIN + nhiều STAFF
- **Quyết định:** ADMIN tạo bằng lệnh trên máy chủ, không tạo được qua giao diện; STAFF do ADMIN quản lý, không xem doanh thu / cài đặt.
- **Hệ quả:** chiếm được giao diện cũng không tự nâng quyền được; quên mật khẩu ADMIN phải vào máy chủ.

### 13. Bỏ dark mode
- **Quyết định:** web chỉ có giao diện sáng theo màu logo (đỏ `#ec3013`, xanh lá `#1f6b3f`, nền kem) — xem `design/color.md`.
- **Hệ quả:** ít CSS cần bảo trì, nhận diện thương hiệu nhất quán.
