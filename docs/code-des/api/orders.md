# API — Orders (`/orders`, `/admin/orders`)

Cửa hàng chỉ nhận **COD** — `paymentMethod` luôn là `cod`; `PaymentMethod` vẫn là enum để sau này thêm thanh toán online. Migration `remove_bank_transfer` đã đổi mọi đơn chuyển khoản cũ sang COD, thu hẹp enum về `cod` và bỏ cột `bankTransferInfo` của `site_settings`. Bill cũ lưu trên máy khách còn ghi `bank_transfer` vẫn hiển thị được (`paymentMethodLabel` trong `packages/types` coi giá trị lạ là COD).

## Web khách hàng

| Method & đường dẫn | Giới hạn | Mô tả |
|---|---|---|
| `POST /orders/quote` | 60 / phút | Báo giá giỏ hàng: tính lại giá theo DB, đánh dấu dòng không mua được (`available`, `issue`: "Sản phẩm đã ngừng bán" / "Hết hàng") |
| `POST /orders` | 5 / 10 phút | Tạo đơn; trả `{ orderNumber, total }` |
| `GET /orders/lookup?orderNumber=&phone=` | 20 / phút | Tra cứu đơn; sai mã và sai SĐT cùng một thông báo để không dò được đơn người khác |

- **Không tin giá từ trình duyệt**: `create` luôn gọi `quote` lại; còn dòng không mua được thì từ chối cả đơn.
- Mỗi dòng lưu lại tên / quy cách / giá tại thời điểm đặt (`OrderItem`), nên sửa hoặc xoá sản phẩm sau này không đổi đơn cũ.
- **Phí vận chuyển = 0** lúc đặt; cửa hàng báo khi gọi xác nhận rồi cập nhật ở admin.
- **Mã đơn**: `DH` + `yyMMdd` (giờ Việt Nam) + 4 ký tự không gây nhầm (bỏ `0/O`, `1/I`); trùng thì thử lại tối đa 5 lần.
- Có `HoneypotField` (`website`) chống bot. SĐT được chuẩn hoá (`+84` → `0`).
- Tạo đơn phát sự kiện admin `order.created` (SSE).

## Quản trị (`@Permission('orders')`)

| Method & đường dẫn | Mô tả |
|---|---|
| `GET /admin/orders` | Danh sách phân trang. Query: `status`, `q` (mã đơn / tên / SĐT), `from`, `to`, `page`, `pageSize` |
| `GET /admin/orders/export` | File Excel các đơn khớp bộ lọc (tối đa 20.000, `@RateLimit(10, 60)`) — sheet "Đơn hàng" (có dòng tổng bỏ đơn huỷ bằng `SUMIFS`) và "Chi tiết sản phẩm" |
| `GET /admin/orders/:id` | Chi tiết + lịch sử trạng thái (`OrderDetail`) |
| `PATCH /admin/orders/:id` | Đổi trạng thái, trạng thái thanh toán, phí vận chuyển, giảm giá, ghi chú nội bộ, ghi chú lần cập nhật |

### Quy tắc cập nhật

- Chuyển trạng thái chỉ theo `TRANSITIONS`: `pending → confirmed | cancelled`; `confirmed → packing | shipping | cancelled`; `packing → shipping | cancelled`; `shipping → delivered | cancelled`; `delivered` / `cancelled` là cuối.
- Đơn đã giao / đã huỷ **không sửa được** phí vận chuyển và giảm giá.
- Giảm giá không được lớn hơn tạm tính + phí vận chuyển. `total = subtotal + shippingFee − discount`.
- Mỗi lần đổi trạng thái ghi một dòng `OrderStatusLog` (người đổi + ghi chú). Cập nhật phát sự kiện admin `order.updated`.

## Code

- `apps/api/src/orders/orders.module.ts` (controller), `orders.service.ts`, `orders.dto.ts`
- `apps/api/src/orders/orders-export.ts` — dựng file Excel (ExcelJS)

Web: [checkout](../web/checkout.md), [order-lookup](../web/order-lookup.md). Admin: [orders](../admin/orders.md).
