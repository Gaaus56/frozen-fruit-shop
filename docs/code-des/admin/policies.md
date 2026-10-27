# Admin — Chính sách (`/policies`, `/policies/new`, `/policies/[id]`)

Cần quyền `policies`. Các trang chính sách (đổi trả, giao hàng, bảo mật…) hiển thị ở chân trang web.

## Danh sách

1. **Gợi ý mẫu soạn sẵn** — hiện các mẫu nội dung có sẵn (đổi trả, vận chuyển…) chưa được tạo; bấm để tạo nhanh.
2. **`Table`** — tiêu đề (link sửa) + slug, thứ tự, trạng thái, nút Sửa + `DeleteButton`.

## Form thêm / sửa (`PolicyForm`)

Tiêu đề, slug (để trống tự tạo; trang nằm ở `/policies/<slug>`), nội dung (`RichTextEditor`: Tiêu đề / Tiêu đề nhỏ, khung Ghi chú / Cảnh báo), thứ tự ở chân trang, "Hiển thị trên website". Trang `new` nhận `?template=` để điền sẵn nội dung mẫu.

**Code**

- `apps/admin/src/app/(dashboard)/policies/page.tsx` — gọi `api<Policy[]>("/admin/policies")`
- `policies/new/page.tsx`, `policies/[id]/page.tsx`, `policies/policy-form.tsx`
- `policies/templates.ts` (`POLICY_TEMPLATES`), `policies/actions.ts`, `policies/layout.tsx`

API: [content](../api/content.md). Web: [policy-detail](../web/policy-detail.md).
