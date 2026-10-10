-- Thẻ cam kết trang sản phẩm do admin chỉnh; NULL = chưa chỉnh lần nào, API trả bộ thẻ mặc định.
ALTER TABLE "site_settings" ADD COLUMN "productAssurances" JSONB;
