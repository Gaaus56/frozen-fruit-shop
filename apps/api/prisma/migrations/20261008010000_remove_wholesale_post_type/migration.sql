-- Bỏ hẳn tính năng bán sỉ: sản phẩm không còn cờ "Nhận đặt sỉ".
-- (Liên hệ loại "wholesale" cũ vẫn giữ trong bảng inquiries để xem lại; web không nhận yêu cầu sỉ mới.)
ALTER TABLE "products" DROP COLUMN "isWholesaleAvailable";

-- Bài viết chia 2 loại cố định thay cho chuyên mục gõ tự do.
CREATE TYPE "PostType" AS ENUM ('knowledge', 'recruitment');
ALTER TABLE "posts" ADD COLUMN "type" "PostType" NOT NULL DEFAULT 'knowledge';
UPDATE "posts" SET "type" = 'recruitment' WHERE "category" ILIKE '%tuyển dụng%' OR "category" ILIKE '%tuyen dung%';
ALTER TABLE "posts" DROP COLUMN "category";

DROP INDEX IF EXISTS "posts_isPublished_publishedAt_idx";
CREATE INDEX "posts_type_isPublished_publishedAt_idx" ON "posts"("type", "isPublished", "publishedAt");
