# API — Inquiries (`/inquiries`, `/admin/inquiries`)

Tin nhắn từ form Liên hệ.

| Method & đường dẫn | Quyền / giới hạn | Mô tả |
|---|---|---|
| `POST /inquiries` | công khai, 5 / 10 phút | Gửi liên hệ: `type` (chỉ nhận `contact`), tên, SĐT, email, nội dung (+ `website` là ô ẩn chống bot). Trả `{ ok: true }` |
| `GET /admin/inquiries` | `inquiries` | Danh sách phân trang, lọc `status` (`new` / `in_progress` / `done`) và `type` |
| `PATCH /admin/inquiries/:id` | `inquiries` | Đổi trạng thái |
| `DELETE /admin/inquiries/:id` | `inquiries` | Xoá |

- `type`: `contact` (hiện dùng) và `wholesale` (liên hệ báo giá sỉ cũ — tính năng sỉ đã bỏ, vẫn lọc / xem được trong admin).
- Gửi liên hệ phát sự kiện admin `inquiry.created` (đổi trạng thái / xoá phát `inquiry.updated`) để hiện thông báo / huy hiệu "Mới".

**Code**

- `apps/api/src/inquiries/inquiries.module.ts` — DTO, `InquiriesService`, hai controller

Web: [contact](../web/contact.md). Admin: [inquiries](../admin/inquiries.md).
