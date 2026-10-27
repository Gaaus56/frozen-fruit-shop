# Admin — Lịch sử chỉnh sửa (`/activity`) — chỉ ADMIN

Ai đã thêm / sửa / xoá gì trong trang quản trị, lúc nào.

1. **Bộ lọc** — theo người thực hiện (danh sách tài khoản) và theo mục (sản phẩm, đơn hàng, banner… — `AUDIT_RESOURCE_LABELS`); nút bỏ lọc.
2. **Danh sách** — mỗi dòng: thời gian, người làm (tên + email), hành động (thêm / sửa / xoá / đặt lại mật khẩu / bật tắt OTP…), mục + tên đối tượng lúc sửa. Bấm vào dòng để xem từng trường đã đổi (**trước → sau**); với mục có trang sửa riêng theo id thì có link "Mở bản ghi này".
3. **`Pagination`** — 30 dòng / trang.

Giá trị đã được rút gọn khi ghi (bỏ HTML, cắt chuỗi dài, ẩn mật khẩu; khoá bí mật OTP và mã dự phòng không bao giờ ghi).

**Code**

- `apps/admin/src/app/(dashboard)/activity/page.tsx` — gọi `api<Paginated<AuditLogEntry>>("/admin/audit-logs?...")` và `api<StaffAccount[]>("/admin/users")`, `requireAdmin()`
- `activity/labels.ts` — nhãn mục, hành động, trường

API: [audit](../api/audit.md).
