# Admin — Banner (`/banners`, `/banners/new`, `/banners/[id]`)

Cần quyền `banners`. Banner có 4 **vị trí hiển thị**:

| Vị trí | Dùng ở web |
|---|---|
| `home` | Slideshow trang chủ — ẩn khi không có banner nào đang bật |
| `products` | Ảnh nền đầu trang Sản phẩm (dùng banner đang bật có thứ tự nhỏ nhất) |
| `news` | Ảnh nền đầu trang Tin tức |
| `about` | Ảnh nền đầu trang Giới thiệu |

## Danh sách

Tab lọc theo vị trí; **`Table`** — ảnh, tiêu đề, liên kết khi bấm, thứ tự, trạng thái, nút Sửa + `DeleteButton`.

## Form thêm / sửa (`BannerForm`)

Vị trí hiển thị, ảnh banner (`ImageUpload`, gợi ý kích thước theo vị trí), tiêu đề, mô tả, **`LinkPicker`** (chọn liên kết từ trang / danh mục / chính sách / bài viết có sẵn hoặc "Link tự nhập…"), chữ trên nút (mặc định "Xem ngay"), thứ tự, "Đang hiển thị trên website".

Với các vị trí ngoài trang chủ, tiêu đề / mô tả của banner thay cho chữ mặc định của `PageHero`; để trống thì web dùng chữ mặc định.

**Code**

- `apps/admin/src/app/(dashboard)/banners/page.tsx` — gọi `api<Banner[]>("/admin/banners?placement=...")`
- `banners/new/page.tsx`, `banners/[id]/page.tsx`, `banners/banner-form.tsx`
- `banners/link-picker.tsx`, `banners/link-options.ts`
- `banners/actions.ts`, `banners/layout.tsx`

API: [content](../api/content.md). Web: [home](../web/home.md), [products](../web/products.md), [news](../web/news.md), [about](../web/about.md).
