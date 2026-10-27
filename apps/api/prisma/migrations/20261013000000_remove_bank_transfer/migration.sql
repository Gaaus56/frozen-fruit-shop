-- Bỏ hẳn thanh toán chuyển khoản: cửa hàng chỉ nhận COD (thu tiền khi giao).
-- 1) Đơn cũ chọn chuyển khoản (chỉ là dữ liệu mẫu) → COD.
UPDATE "orders" SET "paymentMethod" = 'cod' WHERE "paymentMethod" = 'bank_transfer';

-- 2) Tạo lại enum chỉ còn 'cod' (Postgres không xoá được một giá trị khỏi enum).
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
CREATE TYPE "PaymentMethod" AS ENUM ('cod');
ALTER TABLE "orders" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod" USING ("paymentMethod"::text::"PaymentMethod");
ALTER TABLE "orders" ALTER COLUMN "paymentMethod" SET DEFAULT 'cod';
DROP TYPE "PaymentMethod_old";

-- 3) Bỏ ô "Thông tin chuyển khoản" của Thông tin cửa hàng.
ALTER TABLE "site_settings" DROP COLUMN "bankTransferInfo";
