# Web — Giỏ hàng (`/cart`)

`"use client"`, đọc giỏ từ `localStorage` qua `useCart`.

1. **Đang tải** — hiện khi `!isHydrated` (tránh lệch dữ liệu server / client).
2. **Giỏ rỗng** — icon giỏ, "Giỏ hàng của bạn đang trống", nút "Xem sản phẩm" và "Tra cứu đơn hàng".
3. **Danh sách dòng hàng** — ảnh, tên (link `/products/[slug]`), quy cách, đơn giá, bộ đếm −/+ (`updateQuantity`), nút "Xóa" (`removeItem`).
4. **Khối "Tóm tắt đơn hàng"** (dính khi cuộn) — tạm tính, dòng "Phí vận chuyển: Cửa hàng báo khi xác nhận", tổng cộng, nút "Tiến hành thanh toán" (→ `/checkout`) và "Tiếp tục mua sắm" (→ `/products`).

Giá trong giỏ chỉ để hiển thị; giá thật được API tính lại ở bước thanh toán.

**Code**

`apps/web/src/app/cart/page.tsx` — không có component con riêng.

- `lib/cart-context.tsx` — `CartProvider` / `useCart` (`items`, `addItem`, `updateQuantity`, `removeItem`, `clearCart`, `applyQuote`, `subtotal`, `totalQuantity`, `isHydrated`)
- `components/product/product-image.tsx`, `components/ui/container.tsx`, `button.tsx`, `line-icon.tsx`
