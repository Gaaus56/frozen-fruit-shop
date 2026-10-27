# Web — Liên hệ (`/contact`)

1. **"Gửi tin nhắn cho cửa hàng" — `ContactForm`** — tên, SĐT, email, nội dung; gửi qua `sendInquiry({ type: "contact" })`; có `HoneypotField`. Gửi xong có hiệu ứng máy bay giấy + dấu V và nút "Gửi tin nhắn khác".
2. **"Thông tin liên hệ"** — hotline (kèm giờ nghe máy), Zalo, email, Facebook từ `getSettings()`; dòng nào thiếu thì ẩn.
3. **"Địa chỉ cửa hàng"** — địa chỉ, điểm mốc, link "Xem bản đồ chỉ đường", MST + ghi chú. Chỉ hiện nếu có địa chỉ.
4. **"Bản đồ đến cửa hàng"** — iframe Google Maps. Link rút gọn `maps.app.goo.gl` được mở ra để lấy đúng tên địa điểm (ghim + thẻ thông tin), không có thì dùng toạ độ, cuối cùng mới theo địa chỉ chữ.

Các khối thông tin có `editSettings(...)` để admin bấm đúp sửa từ trang Xem trước.

**Code**

`apps/web/src/app/contact/page.tsx` — gọi `getSettings()` và `getMapEmbedUrl()`.

- `components/contact/contact-form.tsx`
- `lib/map-embed.ts`, `lib/api-client.ts` (`sendInquiry`)
- `components/ui/section-heading.tsx`, `container.tsx`, `form.tsx`

> Trang `/wholesale` và form báo giá sỉ đã **được gỡ**. Giá trị `wholesale` vẫn còn trong enum `InquiryType` của database để giữ dữ liệu cũ.

API: [inquiries](../api/inquiries.md).
