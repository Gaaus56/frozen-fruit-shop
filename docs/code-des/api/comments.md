# API — Comments (`/posts/:slug/comments`, `/admin/comments`)

Bình luận của khách dưới bài viết, có duyệt trước khi hiện.

| Method & đường dẫn | Quyền / giới hạn | Mô tả |
|---|---|---|
| `GET /posts/:slug/comments` | công khai | Bình luận **đã duyệt** của bài, cũ trước mới sau, kèm câu trả lời của cửa hàng (`PublicComment`) |
| `POST /posts/:slug/comments` | công khai, 5 / 10 phút | Gửi bình luận (tên, email, nội dung, ô ẩn chống bot). Trả `{ ok: true }` |
| `GET /admin/comments` | `comments` | Danh sách phân trang, lọc `status` (`pending` / `approved` / `hidden`) |
| `PATCH /admin/comments/:id` | `comments` | Đổi trạng thái và / hoặc trả lời (`reply`; chuỗi rỗng = xoá câu trả lời) |
| `DELETE /admin/comments/:id` | `comments` | Xoá |

## Quy tắc

- Chỉ bài **đang hiện trên web** (đã bật, đã tới ngày đăng) mới xem / gửi bình luận được.
- Bình luận mới luôn ở trạng thái `pending` — không hiện cho tới khi admin duyệt.
- Trả lời một bình luận đang chờ = đồng ý cho hiện (chuyển `approved`); ghi `repliedAt`.
- Duyệt / trả lời / xoá gọi `notify('content')` để trang bài viết trên web làm mới ngay và phát `comment.updated`; bình luận mới phát `comment.created` cho admin.

**Code**

- `apps/api/src/comments/comments.module.ts` — DTO, `CommentsService`, `PublicCommentsController`, `AdminCommentsController`

Web: [news-detail](../web/news-detail.md). Admin: [comments](../admin/comments.md).
