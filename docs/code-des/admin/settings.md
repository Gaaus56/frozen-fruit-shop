# Admin — Thông tin cửa hàng (`/settings`) — chỉ ADMIN

Thông tin liên hệ, địa chỉ… hiển thị trên toàn bộ website. **`SettingsForm`** gồm các nhóm:

1. **"Thương hiệu"** — tên cửa hàng, tên rút gọn (hiện ở thanh menu khi cuộn); bật / tắt dải chữ chạy đỏ đầu trang + nội dung (để trống thì tự ghép từ hotline, địa chỉ, giờ mở cửa).
2. **"Liên hệ"** — hotline, giờ nhận điện thoại, số Zalo (trống = dùng hotline), email, trang Facebook. Dùng cho nút gọi / Zalo / Facebook nổi và trang Liên hệ.
3. **"Địa chỉ"** — địa chỉ cửa hàng, mốc dễ tìm, link Google Maps (web dùng để nhúng bản đồ ghim đúng cửa hàng).
4. **"Thẻ cam kết trang sản phẩm"** — tối đa 3 ô dưới nút "Mua ngay" ở trang chi tiết sản phẩm: icon (chọn trong bộ icon nét), tiêu đề, mô tả, liên kết khi bấm. Để trống tiêu đề thì ẩn ô. Gõ `{phone}` / `{hotlineHours}` để web tự thay bằng hotline / giờ nhận máy hiện tại; có lựa chọn "Gọi hotline".
5. **"Pháp lý"** (hiện trên hoá đơn, chân trang) — mã số thuế, ghi chú MST.

> Mục **thông tin chuyển khoản đã bỏ** cùng phương thức chuyển khoản.

Đổi thông tin này là thao tác nhạy cảm — API yêu cầu **OTP** (`@RequireOtp`) nếu tài khoản ADMIN đã bật xác thực 2 lớp; form bọc action bằng `withOtpRetry` nên hộp nhập mã tự mở rồi gửi lại thao tác.

**Code**

- `apps/admin/src/app/(dashboard)/settings/page.tsx` — gọi `api<SiteSettings>("/admin/settings")`, `requireAdmin()`
- `settings/settings-form.tsx`, `settings/actions.ts`
- `lib/link-options-action.ts` (danh sách trang cho ô "Bấm vào thì mở")
- `packages/types`: `SiteSettings`, `ProductAssurance`, `ASSURANCE_ICONS`, `fillSettingsPlaceholders`

API: [content](../api/content.md#thông-tin-cửa-hàng). Web: [shared](../web/shared.md), [product-detail](../web/product-detail.md), [contact](../web/contact.md).
