# Admin — Liên hệ (`/inquiries`)

Cần quyền `inquiries`. Tin nhắn từ form Liên hệ trên website.

1. **Bộ lọc** — theo trạng thái (Mới / Đang xử lý / Xong) và theo loại, dạng chip. Loại "Báo giá sỉ" chỉ còn để xem dữ liệu cũ (tính năng sỉ đã bỏ).
2. **Danh sách thẻ** — mỗi liên hệ một thẻ: tên + công ty (nếu có) + `Badge` loại + `Badge` trạng thái, SĐT / email bấm được, nhu cầu (với báo giá sỉ cũ), nội dung tin nhắn, giờ gửi.
3. **Nút đổi trạng thái nhanh** — "Đánh dấu: …" cho mỗi trạng thái còn lại, cộng nút xoá (`DeleteButton`).
4. **`Pagination`**.

Số liên hệ "Mới" hiện ở huy hiệu trên menu và trong dải việc cần xử lý của Tổng quan.

**Code**

- `apps/admin/src/app/(dashboard)/inquiries/page.tsx` — gọi `api<Paginated<Inquiry>>("/admin/inquiries?...")`
- `inquiries/actions.ts` (`setInquiryStatusAction`, `deleteInquiryAction`), `inquiries/layout.tsx`
- Dùng chung: `badge.tsx`, `delete-button.tsx`, `page-header.tsx`, `pagination.tsx`

API: [inquiries](../api/inquiries.md).
