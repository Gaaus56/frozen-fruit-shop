-- Quyền theo mục cho tài khoản nhân viên. ADMIN luôn đủ quyền (không đọc cột này).
ALTER TABLE "users" ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Nhân viên đang có giữ nguyên quyền như trước khi có phân quyền (mọi mục trừ phần chỉ dành cho ADMIN).
UPDATE "users"
SET "permissions" = ARRAY['orders', 'inquiries', 'products', 'categories', 'banners', 'homeBlocks', 'posts', 'comments', 'pages', 'policies']
WHERE "role" = 'STAFF';
