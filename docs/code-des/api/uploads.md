# API — Uploads (`/admin/uploads`)

`POST /admin/uploads` (`@Auth()`, `@RateLimit(60, 60)`) — nhận một file ảnh (`multipart`, trường `file`), lưu lên đĩa, trả `{ path, url }`.

Quy trình xử lý:

1. Giới hạn **5MB**, một file.
2. **Nhận diện định dạng bằng magic bytes** (JPG / PNG / WEBP / GIF), không tin phần mở rộng hay mimetype do client gửi.
3. **Nén**: xoay đúng chiều theo EXIF, thu nhỏ nếu cạnh dài > 2000px, bỏ toàn bộ metadata (GPS, máy chụp…), lưu WebP chất lượng 82. Nếu bản WebP không nhẹ hơn thì giữ file gốc. GIF giữ nguyên (có thể là ảnh động). Ảnh hỏng → báo lỗi thay vì lưu file rác.
4. Lưu `UPLOAD_DIR/yyyy/mm/<12 byte ngẫu nhiên>.<ext>`; DB lưu đường dẫn tương đối `/uploads/...`, API trả URL tuyệt đối theo `PUBLIC_URL`.

**Phía trình duyệt (admin)** — `shrinkImage` trong `components/ui/image-upload.tsx` thu nhỏ ảnh trước khi gửi, vì Vercel chặn request trên khoảng 4,5MB: chọn tối đa 30MB, xoay theo EXIF, cạnh dài ≤ 2000px, WebP 0,86 (không mã hoá được WebP thì JPEG; PNG giữ PNG để không mất nền trong suốt; GIF và ảnh đã nhỏ ≤ 1,5MB giữ nguyên). Sau khi thu nhỏ còn trên 4MB thì báo lỗi. API rồi nén thêm một lần nữa như trên.

Ảnh được phục vụ tĩnh ở `/uploads/*` với cache 365 ngày vì tên file ngẫu nhiên. Việc gắn ảnh vào bản ghi được ghi ở lịch sử chỉnh sửa của bản ghi đó, không ghi riêng việc tải ảnh.

**Code**

- `apps/api/src/uploads/uploads.module.ts` — `UploadsService`, `UploadsController`
- Phía admin: `apps/admin/src/lib/upload-action.ts`, `components/ui/image-upload.tsx`
