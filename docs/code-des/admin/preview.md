# Admin — Xem trước & sửa (`/preview`) — chỉ ADMIN

Mở website khách trong một khung ngay trong trang quản trị để sửa trực tiếp theo giao diện thật.

1. **Công tắc chế độ** — *Chế độ sửa* (rê chuột lên web: phần nào sửa được thì có viền đỏ + nhãn; **bấm đúp** để mở trang sửa phần đó) và *Chế độ duyệt* (bấm như khách để đi tới trang cần sửa).
2. **Thanh địa chỉ** — nhập đường dẫn trong web (chỉ nhận `/…`), các link nhanh (Trang chủ, Sản phẩm, Tin tức, Giới thiệu, Liên hệ), nút tải lại và mở tab mới.
3. **Kích thước màn hình** — Máy tính / Máy tính bảng (820px) / Điện thoại (390px). Admin đang mở trên màn hình nhỏ thì luôn xem bản điện thoại.
4. **Khung `iframe`** chứa web.

**Cách hoạt động** — web và admin nói chuyện qua `postMessage` (chỉ nhận đúng origin của nhau):

- web gửi `tc28:ready` khi nạp xong, `tc28:path` mỗi lần đổi trang, và thông tin phần được bấm đúp;
- admin gửi `tc28:preview` kèm chế độ hiện tại.

Các phần sửa được trên web được đánh dấu bằng `editTarget(kind, id, label)` (`data-edit="banner:<id>"`…). Bấm đúp → admin mở trang sửa tương ứng và nhớ trang web đang xem (`lib/preview.ts`) để hiện nút **"Quay lại xem trước"** ở mọi trang, kể cả sau khi lưu.

**Code**

- `apps/admin/src/app/(dashboard)/preview/page.tsx`, `preview-client.tsx`, `layout.tsx`
- `apps/admin/src/lib/preview.ts`, `components/layout/preview-return.tsx`
- Phía web: `apps/web/src/components/layout/preview-edit-overlay.tsx`, `apps/web/src/lib/edit-target.ts`
- `packages/types`: `EditKind`, `SettingsSection`, `PreviewMessage`

Biến môi trường: `NEXT_PUBLIC_WEB_URL` (admin) và `NEXT_PUBLIC_ADMIN_URL` (web) phải trỏ đúng nhau.
