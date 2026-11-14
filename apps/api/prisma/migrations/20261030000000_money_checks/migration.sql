-- Ràng buộc toàn vẹn tiền / số lượng ở tầng database (API đã kiểm tra, đây là lớp chặn cuối nếu code có lỗi
-- hoặc ai sửa tay trong DB). NOT VALID: chỉ áp cho dữ liệu ghi mới — không quét / không chặn dữ liệu cũ,
-- nên migration luôn chạy được trên mọi database. Muốn kiểm cả dữ liệu cũ: ALTER TABLE ... VALIDATE CONSTRAINT ...

ALTER TABLE "product_variants"
  ADD CONSTRAINT "product_variants_price_check" CHECK ("price" >= 0) NOT VALID,
  ADD CONSTRAINT "product_variants_compare_at_price_check" CHECK ("compareAtPrice" IS NULL OR "compareAtPrice" >= 0) NOT VALID;

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_quantity_check" CHECK ("quantity" > 0) NOT VALID,
  ADD CONSTRAINT "order_items_unit_price_check" CHECK ("unitPrice" >= 0) NOT VALID,
  ADD CONSTRAINT "order_items_line_total_check" CHECK ("lineTotal" = "unitPrice" * "quantity") NOT VALID;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_amounts_check" CHECK ("subtotal" >= 0 AND "shippingFee" >= 0 AND "discount" >= 0 AND "total" >= 0) NOT VALID,
  ADD CONSTRAINT "orders_total_check" CHECK ("total" = "subtotal" + "shippingFee" - "discount") NOT VALID;
