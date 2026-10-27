# Admin — Tổng quan (`/`) — chỉ ADMIN

1. **Bộ lọc khoảng thời gian** — 4 nút 7 / 30 / 90 / 365 ngày (`?days=`, mặc định 30).
2. **Dải việc cần xử lý** — link thẳng tới đơn chờ xác nhận (`/orders?status=pending`) và liên hệ mới (`/inquiries?status=new`); chỉ hiện nếu có.
3. **4 ô `Stat`** — Doanh thu, Số đơn hàng, Giá trị trung bình / đơn (kèm số sản phẩm đã bán), Đơn bị huỷ (kèm tỉ lệ). Doanh thu và số đơn có % tăng / giảm so với kỳ trước (cùng số ngày ngay trước đó).
4. **`RevenueChart`** — "Doanh thu theo thời gian": biểu đồ cột theo ngày, tự gộp theo nhóm ngày khi khoảng thời gian dài; rê chuột xem doanh thu + số đơn.
5. **`Bars`** (trong `Panel`) — "Sản phẩm bán chạy (theo doanh thu)", "Doanh thu theo danh mục", "Đơn hàng theo trạng thái".
6. **"Đơn hàng gần đây"** — danh sách rút gọn, link `/orders` và từng đơn.
7. **"Kho & danh mục"** — số sản phẩm đang bán, số danh mục, số quy cách sắp hết / hết hàng, danh sách cảnh báo tồn kho (link tới sản phẩm).

Doanh thu = tổng tiền các đơn **không bị huỷ**, tính theo ngày đặt, múi giờ Việt Nam.

**Code**

`apps/admin/src/app/(dashboard)/page.tsx` — `Stat`, `Panel`, `Bars`, `RevenueChart` là hàm viết ngay trong file (không tách component). Gọi `api<DashboardStats>("/admin/stats?days=")`, yêu cầu `requireAdmin()`.

Component dùng chung: `components/ui/badge.tsx`, `page-header.tsx`, `scramble-number.tsx`.
API: [stats](../api/stats.md).
