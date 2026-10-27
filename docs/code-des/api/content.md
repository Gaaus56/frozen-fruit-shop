# API — Content: Banners, Posts, Policies, Pages, Home blocks, Settings

Cùng nằm trong `ContentModule` nhưng mỗi loại có controller và quyền riêng. Mọi thao tác ghi gọi `notify('content')` (riêng settings là `'settings'`) để web xoá cache.

| Loại | Công khai | Quản trị (quyền) |
|---|---|---|
| Banner | `GET /banners?placement=` (mặc định `home`) | `/admin/banners` — GET, GET `:id`, POST, PATCH `:id`, DELETE `:id` (`banners`) |
| Bài viết | `GET /posts?limit=&type=`, `GET /posts/:slug` | `/admin/posts` (`posts`) |
| Chính sách | `GET /policies`, `GET /policies/:slug` | `/admin/policies` (`policies`) |
| Trang cố định | `GET /pages/:slug` | `GET` / `PUT /admin/pages/:slug` (`pages`) |
| Khối trang chủ | `GET /home-blocks` | `/admin/home-blocks` (`homeBlocks`) |
| Thông tin cửa hàng | `GET /settings` | `GET /admin/settings` (đăng nhập), `PUT /admin/settings` (**ADMIN** + `@RequireOtp()`) |

## Banner (`content/banners.ts`)

`placement`: `home` · `products` · `news` · `about`. `linkUrl` là đường dẫn trong web (`/products`) hoặc URL đầy đủ. Công khai chỉ trả banner đang bật, theo `sortOrder`.

## Bài viết (`content/posts.ts`)

- `type`: `knowledge` | `recruitment`.
- Công khai chỉ trả bài **đã bật và đã tới `publishedAt`** — hẹn giờ đăng bằng cách đặt ngày tương lai.
- `content` là HTML, được `sanitizeRichText` lọc khi lưu.

## Chính sách (`content/policies.ts`)

Công khai chỉ trả chính sách đang bật; `GET /policies/:slug` trả 404 nếu đã tắt.

## Trang cố định (`content/pages.ts`)

Hiện chỉ có `about`. Chưa có dòng trong DB → API trả **nội dung mặc định** (thay `{storeName}` bằng tên cửa hàng hiện tại) để admin mở ra thấy đúng chữ đang hiển thị. `PUT` lưu (upsert) theo slug.

## Khối trang chủ (`content/home-blocks.ts`)

`position`: `after_hero` · `after_categories` · `after_products` · `after_news`; `framed` (khung trắng bo góc); sắp theo `position` rồi `sortOrder`. Công khai chỉ trả khối đang bật.

## Thông tin cửa hàng (`content/settings.ts`)

- Một dòng duy nhất (`id = 1`). Chưa có dòng → trả `DEFAULT_SITE_SETTINGS`.
- `productAssurances` (tối đa `MAX_PRODUCT_ASSURANCES` = 3 thẻ cam kết): `null` = chưa chỉnh → dùng bộ mặc định; ô để trống tiêu đề bị bỏ khi lưu; icon dạng emoji cũ được đổi sang tên icon nét; link chỉ nhận trang trong web, `http(s)`, `tel:`, `mailto:` (chặn `javascript:`…).
- Sửa là thao tác nhạy cảm (đổi hotline / Zalo / Facebook là cách dễ lừa khách nhất) nên cần OTP.

## Code

- `apps/api/src/content/content.module.ts` (gom module)
- `banners.ts`, `posts.ts`, `policies.ts`, `pages.ts`, `home-blocks.ts`, `settings.ts`
- `apps/api/src/common/rich-text.ts` — bộ lọc HTML dùng cho posts / policies / pages / home blocks / mô tả sản phẩm

Admin: [banners](../admin/banners.md) · [posts](../admin/posts.md) · [policies](../admin/policies.md) · [pages](../admin/pages.md) · [home-blocks](../admin/home-blocks.md) · [settings](../admin/settings.md).
