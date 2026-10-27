# Web — Tra cứu đơn hàng (`/order-lookup`)

`"use client"` — gồm hai phần: tra cứu bằng mã + SĐT và danh sách **bill đã lưu trên máy**.

1. **Form tra cứu** — mã đơn (ví dụ `DH260929ABCD`) + số điện thoại → `lookupOrder()`.
2. **Kết quả** — mã đơn + ngày đặt, **`StatusTimeline`** 5 bước (Chờ xác nhận → Đã xác nhận → Đóng gói → Đang giao → Đã giao; hoặc dòng đỏ "Đơn hàng đã bị huỷ"), danh sách sản phẩm, tạm tính, phí vận chuyển ("Báo khi xác nhận" nếu đơn còn chờ), giảm giá (nếu có), tổng cộng, thanh toán, địa chỉ giao. Có nút **Xuất bill** (lưu vào máy và mở `ReceiptDialog`).
3. **"Bill đã lưu trên máy này"** — tối đa 20 bill gần nhất (từ `localStorage`). Mỗi bill có nút xem lại (mở `ReceiptDialog` với hiệu ứng in), cập nhật trạng thái mới nhất (`refresh`) và xoá khỏi máy (đơn vẫn còn ở cửa hàng). Có icon giải thích bill lưu ở đâu.

**Code**

`apps/web/src/app/order-lookup/page.tsx` — gọi `getSettings()` rồi truyền `store` xuống (in đầu bill).
Logic + giao diện: `apps/web/src/components/order/order-lookup.tsx`.

- `components/receipt/receipt-dialog.tsx`, `receipt-printer.tsx`, `receipt-paper.tsx`, `print-invoice.tsx`
- `components/ui/container.tsx`, `section-heading.tsx`, `button.tsx`, `form.tsx`
- `lib/api-client.ts` (`lookupOrder`), `lib/saved-receipts.ts` (`useSavedReceipts`, `saveReceipt`, `removeReceipt`)

Tra cứu bị giới hạn tần suất theo IP ở API.
