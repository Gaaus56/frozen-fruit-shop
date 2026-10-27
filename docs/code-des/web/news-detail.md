# Web — Chi tiết bài viết (`/news/[slug]`)

Toàn bộ bài nằm trong một khung trắng bo góc căn giữa.

1. **Đầu bài** — `BackButton` + loại bài (link về `/news?type=...`), tiêu đề, ngày đăng.
2. **Ảnh bìa** — chỉ hiện nếu có `coverImage`.
3. **Trích đoạn** (in đậm, nếu có) và **`TableOfContents`** — mục lục tự tạo từ các thẻ `h2` / `h3` (chỉ khi bài có từ 2 tiêu đề); đánh số 1, 1.1…, bấm cuộn mượt tới mục, thu gọn được.
4. **Nội dung** — `RichContent`: HTML đã lọc; ô / link sản phẩm đứng riêng một dòng được dựng thành thẻ sản phẩm (nhiều thẻ liền nhau thành một hàng tự lướt); hỗ trợ khối chia 2 cột.
5. **Khối "Ứng tuyển"** — chỉ với bài loại Tuyển dụng: nút Nhắn Zalo / Gọi / Gửi email.
6. **`RelatedPosts`** ("Xem thêm") — tối đa 5 bài mới nhất cùng loại, thiếu thì lấy thêm loại khác.
7. **Bình luận** — `CommentList` (bình luận đã duyệt, cũ trước mới sau, kèm câu trả lời của cửa hàng) và `CommentForm` (tên, email, nội dung, tuỳ chọn "Lưu tên, email" vào `localStorage`). Bình luận mới **luôn chờ admin duyệt** mới hiện.

`generateMetadata` đặt title / description / ảnh OpenGraph; không có bài → `notFound()`.

**Code**

`apps/web/src/app/news/[slug]/page.tsx` — gọi `getPost(slug)`, `getSettings()`, `getComments(slug)`.

- `components/post/comment-form.tsx`, `comment-list.tsx`, `related-posts.tsx`, `table-of-contents.tsx`, `post-card.tsx`
- `components/ui/rich-content.tsx`, `back-button.tsx`
- `lib/rich-headings.ts` (`extractHeadings`, `withHeadingIds`), `lib/api-client.ts` (`sendComment`)

Admin: [posts](../admin/posts.md), [comments](../admin/comments.md).
