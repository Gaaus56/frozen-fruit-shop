# Admin — thành phần dùng chung

`apps/admin` (Next.js, cổng 3002) là trang quản trị cho chủ shop và nhân viên. Mọi dữ liệu đi qua API; admin không truy cập database.

## Phiên đăng nhập & phân quyền

- **Cookie `admin_token`** (httpOnly) giữ access token JWT — JavaScript phía trình duyệt không đọc được. Server Component / Server Action đọc cookie rồi gắn `Authorization: Bearer` khi gọi API (`lib/session.ts`, `lib/api.ts`).
- **`proxy.ts`** — chặn sớm: chưa có cookie thì chuyển về `/login`; đã có cookie mà vào `/login` thì về `/`. Các đường `/login`, `/logout`, `/api/*` được bỏ qua. Việc kiểm tra token thật (hết hạn, khoá, đúng vai trò) do API làm ở mỗi request.
- **`lib/auth.ts`** — `getCurrentUser()` (gọi `/auth/me`, cache theo request), `requireAdmin()` (trang chỉ dành cho ADMIN), `requirePermission(permission)` (mục cần quyền nhân viên). Bị chặn thì đưa về mục đầu tiên được vào kèm thông báo `ForbiddenNotice`.
- **`lib/nav.ts`** — danh sách menu + quyền cần để thấy từng mục (`NAV_GROUPS`, `canSee`, `homePathFor`). Menu bên và kiểm tra quyền ở server dùng chung một nguồn.

### Vai trò & quyền

| Vai trò | Thấy gì |
|---|---|
| `ADMIN` (duy nhất 1 tài khoản) | Tất cả, gồm các mục *chỉ ADMIN*: Tổng quan, Xem trước & sửa, Thông tin cửa hàng, Tài khoản nhân viên, Lịch sử chỉnh sửa |
| `STAFF` | Chỉ các mục được cấp trong `permissions`: `orders`, `inquiries`, `products`, `categories`, `banners`, `homeBlocks`, `posts`, `comments`, `pages`, `policies` |

Quyền nhân viên được API đọc lại từ DB ở mỗi request, nên admin bỏ quyền là có hiệu lực ngay.

## OTP step-up

Thao tác nhạy cảm (sửa Thông tin cửa hàng, quản lý nhân viên, đổi mật khẩu) bị API từ chối `403 OTP_REQUIRED` nếu tài khoản đã bật OTP mà chưa nhập mã trong 10 phút gần nhất.

- Server Action trả `{ otpRequired: true }` → `withOtpRetry(action)` (`lib/otp-step-up.ts`) gọi `requestOtp()` mở **`OtpStepUpDialog`** (`components/layout/otp-step-up-dialog.tsx`, gắn một lần trong layout); nhập đúng mã thì lưu token mới (`otpStepUpAction`) và **tự gửi lại đúng thao tác đó**; bấm Huỷ thì form hiện lỗi như bình thường.
- Dùng được cho `useActionState` (`withOtpRetry(saveSettingsAction)`) lẫn nút bấm (`withOtpRetry(() => action(id))`).

## Layout `(dashboard)`

`apps/admin/src/app/(dashboard)/layout.tsx` — lấy user hiện tại và **số việc cần xử lý** (đơn chờ xác nhận, liên hệ mới, bình luận chờ duyệt — chỉ hỏi mục tài khoản có quyền) rồi dựng:

1. **`Sidebar`** — menu theo `NAV_GROUPS` (Bán hàng · Sản phẩm · Nội dung web · Hệ thống) kèm huy hiệu số việc cần xử lý.
2. **`LiveUpdates`** — nghe SSE `/admin/events` qua route `app/api/events/route.ts` (đơn / liên hệ mới, người khác sửa dữ liệu) để làm mới trang và phát âm báo.
3. **`EnterAnimation`** — hiệu ứng vào trang sau đăng nhập.
4. **`PreviewReturn`** — nút "Quay lại xem trước" ở mọi trang khi admin vừa bấm Sửa từ trang Xem trước.
5. **`ForbiddenNotice`** — thông báo "không có quyền" sau khi bị chuyển hướng.
6. **`OtpStepUpDialog`** + banner nhắc bật OTP (hiện với ADMIN chưa bật, link `/account#otp`).

Ngoài `(dashboard)`: `app/login`, `app/logout/route.ts`, `app/layout.tsx` (layout gốc, không có Sidebar), `error.tsx`, `global-error.tsx`, `not-found.tsx`.

**Theo dõi lỗi:** `src/instrumentation.ts`, `src/instrumentation-client.ts` và các trang `error.tsx` / `global-error.tsx` gửi lỗi lên Sentry (chỉ khi có DSN) — xem [api/core.md](../api/core.md#theo-dõi-lỗi-sentry).

## Route handler

- `app/api/events/route.ts` — chuyển tiếp luồng SSE `/admin/events` (token nằm trong cookie httpOnly nên trình duyệt không gọi thẳng API được).
- `app/api/export/orders/route.ts` — tải file Excel đơn hàng: gắn token, chuyển bộ lọc (trạng thái, ô tìm, khoảng ngày theo giờ Việt Nam) sang `/admin/orders/export` và trả nguyên file về.

## Mẫu quen thuộc của mỗi mục

- `page.tsx` (danh sách) → `new/page.tsx` + `[id]/page.tsx` (form thêm / sửa) → `*-form.tsx` → `actions.ts` (Server Action bọc bằng `runAction`).
- `layout.tsx` trong mục chỉ gọi `requirePermission(...)`.
- Form dùng `useActionState`; `UnsavedChangesGuard` cảnh báo khi rời trang có thay đổi chưa lưu.

## `apps/admin/src/components/`

**`ui/`**

- `button.tsx` (`Button`, `LinkButton`, `SubmitButton`, `buttonClass`), `form.tsx` (`Field`, `Checkbox`, `Section`, `FormAlert`, `inputClass`)
- `table.tsx` (`Table`, `Th`, `Td`), `pagination.tsx`, `badge.tsx` (`Badge` + `ORDER_STATUS_TONE`, `STOCK_TONE`…)
- `page-header.tsx` (`PageHeader` có nút `?` hiện hướng dẫn), `help.tsx` (`HelpButton`, `WithHelp`)
- `image-upload.tsx` (`ImageUpload`, `ImageListUpload`, `uploadFile` — chọn tối đa 30MB, `shrinkImage` thu nhỏ ở trình duyệt xuống ≤ 2000px / WebP rồi gửi qua `uploadImageAction`; chi tiết ở [api/uploads.md](../api/uploads.md))
- `delete-button.tsx` (xác nhận trước khi xoá; nhận `otpRequired` thì hỏi mã OTP rồi xoá lại), `submit-button.tsx`, `unsaved-changes-guard.tsx`
- `fading-scroll-area.tsx`, `scramble-number.tsx`, `status-page.tsx`

**`editor/`** — trình soạn thảo rich text (TipTap): `rich-text-editor.tsx`, `extensions.tsx` (khối ảnh có chú thích, ô sản phẩm, 2 cột, khung ghi chú, nút…), `link-select.tsx` (chọn link từ trang có sẵn). Dùng trong bài viết, chính sách, trang Giới thiệu, khối trang chủ, mô tả sản phẩm. HTML sinh ra được API lọc lại (`sanitizeRichText`).

**`layout/`** — `sidebar.tsx`, `live-updates.tsx`, `enter-animation.tsx`, `forbidden-notice.tsx`, `preview-return.tsx`, `logo-badge.tsx`, `logout-button.tsx`.

## `apps/admin/src/lib/`

- `api.ts` — `api<T>()` (gọi API kèm token; 401 → về `/login`), `ApiError` (có `code`, ví dụ `OTP_REQUIRED`), `runAction()` (bọc thao tác ghi để lỗi hiện trên form thay vì làm sập trang; gặp `OTP_REQUIRED` thì trả `otpRequired: true`)
- `auth.ts`, `session.ts`, `nav.ts` — như trên
- `otp-actions.ts`, `otp-step-up.ts` — Server Action OTP và `withOtpRetry`
- `upload-action.ts` — `uploadImageAction` (nhận ảnh đã thu nhỏ, tối đa 5MB, chuyển tiếp lên `/admin/uploads`)
- `link-options-action.ts`, `product-options.ts` — danh sách trang / sản phẩm cho ô chọn liên kết và ô sản phẩm trong trình soạn thảo
- `preview.ts` — địa chỉ web + nhớ trang đang xem để quay lại từ trang sửa
- `shared-event-source.ts` — một kết nối SSE dùng chung cho mọi tab (bản sao của web — sửa thì sửa cả hai)
- `format.ts` — định dạng tiền / ngày / số
