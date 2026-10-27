# Web — Thanh toán (`/checkout`)

Cửa hàng chỉ nhận **thanh toán khi giao hàng (COD)** — không còn bước chọn phương thức thanh toán hay thông tin chuyển khoản; trang chỉ ghi "Tiền mặt khi nhận hàng (COD)". Bill cũ lưu trên máy khách còn ghi chuyển khoản vẫn hiển thị bình thường (hiển thị là COD qua `paymentMethodLabel`).

1. **Thông tin người nhận** — họ tên, SĐT, email (không bắt buộc), địa chỉ giao hàng, ghi chú cho cửa hàng; có `HoneypotField` chống bot.
2. **Khung "Đơn hàng của bạn"** (cột phải, dính khi cuộn) — gọi `quoteCart()` báo giá lại từ API mỗi khi giỏ đổi hoặc khi nhận `DATA_CHANGED_EVENT` (admin đổi giá / ẩn sản phẩm). Hiện từng dòng (ảnh, tên, quy cách × số lượng, cảnh báo nếu hết hàng / ngừng bán), tạm tính, tổng tạm tính và nút đặt hàng — khoá nếu có dòng không mua được.
3. **`OrderButton`** — nút "Đặt hàng" có hiệu ứng thùng hàng rơi vào xe tải (bỏ qua nếu người dùng bật "giảm chuyển động").
4. **Màn hình thành công** (thay toàn bộ form):
   - dấu V + mã đơn, lời nhắn "cửa hàng sẽ gọi xác nhận và báo phí vận chuyển" kèm hotline;
   - **`ReceiptPrinter`** — bill giấy nhiệt "in" ra từng nấc; sau đó có nút *Tải ảnh bill* (PNG), *In / Lưu PDF* (hoá đơn A4), *In lại*;
   - bill được lưu vào `localStorage` để xem lại ở `/order-lookup`; nếu trình duyệt chặn lưu thì nhắc khách tải ảnh bill.

Luồng đặt: `quoteCart` → `placeOrder` → `lookupOrder` (lấy bill đúng như đã lưu; lỗi mạng thì dựng bill từ báo giá) → `saveReceipt` → `clearCart`.

**Code**

`apps/web/src/app/checkout/page.tsx` — gọi `getSettings()` rồi truyền `store` (tên, SĐT, địa chỉ, MST — in đầu bill) xuống.
Toàn bộ logic + giao diện: `apps/web/src/components/checkout/checkout-form.tsx`.

- `components/checkout/order-button.tsx`
- `components/receipt/receipt-printer.tsx`, `receipt-paper.tsx`, `print-invoice.tsx`
- `components/ui/form.tsx`, `check-icon.tsx`, `components/product/product-image.tsx`
- `components/layout/live-updates.tsx` (import `DATA_CHANGED_EVENT`)
- `lib/api-client.ts` (`quoteCart`, `placeOrder`, `lookupOrder`), `lib/saved-receipts.ts`, `lib/receipt-content.ts`, `lib/receipt-image.ts`

API: [orders](../api/orders.md).
