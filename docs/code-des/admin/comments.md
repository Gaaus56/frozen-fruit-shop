# Admin — Bình luận (`/comments`)

Cần quyền `comments`. Bình luận của khách dưới bài viết. Bình luận mới **chờ duyệt** — chỉ hiện trên web sau khi bấm Duyệt (hoặc trả lời).

1. **Tab trạng thái** — Chờ duyệt (kèm số lượng) / Đang hiện / Đã ẩn / Tất cả.
2. **Danh sách thẻ** — tên, email (bấm gửi mail), `Badge` trạng thái, bài viết chứa bình luận (link sửa bài), nội dung, giờ gửi, câu trả lời của cửa hàng (nếu có).
3. **Nút nhanh** — Chờ duyệt: "Duyệt" / "Ẩn (spam)"; Đang hiện: "Ẩn"; Đã ẩn: "Hiện lại"; cộng nút xoá.
4. **`ReplyForm`** — trả lời của cửa hàng, hiện ngay dưới bình luận trên web. Trả lời một bình luận đang chờ = đồng ý cho hiện. Để trống = xoá câu trả lời.

Số bình luận chờ duyệt hiện ở huy hiệu trên menu.

**Code**

- `apps/admin/src/app/(dashboard)/comments/page.tsx` — gọi `api<Paginated<Comment>>("/admin/comments?...")`
- `comments/reply-form.tsx`, `comments/actions.ts` (`setCommentStatusAction`, `deleteCommentAction`, trả lời), `comments/layout.tsx`

API: [comments](../api/comments.md). Web: [news-detail](../web/news-detail.md).
