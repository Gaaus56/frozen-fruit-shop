# Web — Trang chính sách (`/policies/[slug]`)

1. **Tiêu đề** — `policy.title`.
2. **Nội dung** — HTML rich text do admin soạn (`RichContent`) trong khung trắng bo góc.

`generateMetadata` lấy title theo chính sách; không có hoặc đã tắt → `notFound()`.
Các chính sách đang bật được liệt kê ở cột "Chính sách" của `Footer`.

**Code**

`apps/web/src/app/policies/[slug]/page.tsx` — gọi `getPolicy(slug)`. Dùng `Container`, `RichContent` và `editTarget("policy", ...)`.

Admin quản lý: [policies](../admin/policies.md).
