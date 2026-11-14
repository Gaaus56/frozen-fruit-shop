-- Bình luận bài viết: mặc định chờ duyệt, admin duyệt / ẩn / trả lời.
CREATE TYPE "CommentStatus" AS ENUM ('pending', 'approved', 'hidden');

CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'pending',
    "reply" TEXT NOT NULL DEFAULT '',
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "comments_postId_status_createdAt_idx" ON "comments"("postId", "status", "createdAt");
CREATE INDEX "comments_status_createdAt_idx" ON "comments"("status", "createdAt");

ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
