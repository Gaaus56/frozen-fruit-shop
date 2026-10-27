# API — Stats (`/admin/stats`) — chỉ ADMIN

`GET /admin/stats?days=7|30|90|365` (mặc định 30) → `DashboardStats` cho trang Tổng quan.

Nội dung trả về:

- `summary` — doanh thu, số đơn, giá trị trung bình / đơn, số sản phẩm đã bán, đơn huỷ, tỉ lệ huỷ — kèm doanh thu / số đơn của kỳ trước để so sánh
- `pending` — đơn chờ xác nhận, đơn đang xử lý, liên hệ mới
- `catalog` — sản phẩm đang bán, số danh mục, quy cách sắp hết, quy cách hết hàng
- `revenueByDay` — đủ mọi ngày trong khoảng (kể cả ngày không có đơn)
- `ordersByStatus`, `topProducts`, `revenueByCategory`, `stockAlerts`, `recentOrders`

Quy ước: doanh thu = tổng tiền các đơn **không bị huỷ**, tính theo ngày đặt hàng, múi giờ Việt Nam (mốc 00:00 giờ VN); kỳ so sánh là cùng số ngày ngay trước đó.

**Code**

- `apps/api/src/stats/stats.module.ts` — `StatsQuery`, `StatsService`, `StatsController`, `StatsModule`

Admin: [dashboard](../admin/dashboard.md).
