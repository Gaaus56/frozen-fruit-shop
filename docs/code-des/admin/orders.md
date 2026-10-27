# Admin — Đơn hàng (`/orders`, `/orders/[id]`)

Cần quyền `orders`. Cửa hàng chỉ nhận COD nên không còn cột / ô chọn phương thức thanh toán.

## Danh sách (`/orders`)

1. **Tab trạng thái** — Tất cả / Chờ xác nhận / Đã xác nhận / Đang đóng gói / Đang giao / Đã giao / Đã huỷ.
2. **Ô tìm kiếm** — theo mã đơn, tên hoặc SĐT khách.
3. **Bộ lọc ngày + nút "Xuất Excel"** — từ ngày / đến ngày (giờ Việt Nam); nút tải file `.xlsx` của các đơn khớp bộ lọc đang xem (tối đa 20.000 đơn) qua `/api/export/orders`.
4. **`Table`** — mã đơn (link chi tiết), khách hàng, ngày đặt, `Badge` trạng thái, `Badge` thanh toán, tổng tiền.
5. **`Pagination`** — 20 đơn / trang.

## Chi tiết (`/orders/[id]`)

1. **Tiêu đề** — mã đơn, giờ đặt, `Badge` trạng thái, nút **`PrintButton`** (in phiếu).
2. **"Sản phẩm"** — bảng từng dòng hàng (tên + quy cách + đơn giá × số lượng), tạm tính / phí ship / giảm giá / tổng cộng.
3. **"Khách hàng & giao hàng"** — tên, SĐT (bấm gọi), email, trạng thái thanh toán, địa chỉ, ghi chú của khách (nền vàng nếu có).
4. **"Lịch sử xử lý"** — dòng thời gian từng lần đổi trạng thái, kèm người đổi và ghi chú.
5. **`OrderUpdateForm`** (cột phải, dính khi cuộn) — nút chuyển nhanh sang bước kế tiếp (Xác nhận đơn → Bắt đầu đóng gói → Giao cho vận chuyển → Đã giao thành công) + nút Huỷ đơn; bên dưới là form đầy đủ: chuyển trạng thái, ghi chú lần cập nhật, phí vận chuyển, giảm giá, trạng thái thanh toán, ghi chú nội bộ. Đơn đã giao / đã huỷ thì khoá phần trạng thái và tiền.

Bước chuyển trạng thái hợp lệ (API kiểm tra, UI chỉ gợi ý): `pending → confirmed | cancelled`, `confirmed → packing | shipping | cancelled`, `packing → shipping | cancelled`, `shipping → delivered | cancelled`.

**Code**

- `apps/admin/src/app/(dashboard)/orders/page.tsx` — gọi `api<Paginated<Order>>("/admin/orders?...")`
- `apps/admin/src/app/(dashboard)/orders/[id]/page.tsx` — gọi `api<OrderDetail>("/admin/orders/:id")`
- `orders/[id]/order-update-form.tsx`, `orders/[id]/print-button.tsx`
- Action: `orders/actions.ts`; layout: `orders/layout.tsx` (`requirePermission("orders")`)
- `apps/admin/src/app/api/export/orders/route.ts` — tải Excel
- Dùng chung: `components/ui/table.tsx`, `badge.tsx`, `pagination.tsx`, `form.tsx`, `button.tsx`

API: [orders](../api/orders.md).
