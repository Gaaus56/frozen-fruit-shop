-- Khối nội dung admin tự soạn trên trang chủ. Nội dung là HTML đã lọc.
CREATE TYPE "HomeBlockPosition" AS ENUM ('after_hero', 'after_categories', 'after_products', 'after_news');

CREATE TABLE "home_blocks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "framed" BOOLEAN NOT NULL DEFAULT true,
    "position" "HomeBlockPosition" NOT NULL DEFAULT 'after_hero',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_blocks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "home_blocks_isActive_position_sortOrder_idx" ON "home_blocks"("isActive", "position", "sortOrder");
