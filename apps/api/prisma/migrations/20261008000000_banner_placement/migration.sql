-- Banner có thể đặt ở trang chủ (mặc định, như trước) hoặc đầu trang Sản phẩm.
CREATE TYPE "BannerPlacement" AS ENUM ('home', 'products');

ALTER TABLE "banners" ADD COLUMN "placement" "BannerPlacement" NOT NULL DEFAULT 'home';
