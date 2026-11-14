// Khởi tạo lại database SẠCH (không dữ liệu mẫu): xoá toàn bộ bảng, chạy lại mọi migration,
// rồi tạo tài khoản ADMIN duy nhất. Dùng khi bàn giao cho cửa hàng hoặc muốn demo bắt đầu từ trang trắng.
//
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:reset:clean
//
// An toàn: từ chối khi NODE_ENV=production; DATABASE_URL không phải máy cục bộ thì phải đặt RESET_ALLOW_REMOTE=1.
// Sau khi chạy: web dùng thông tin cửa hàng mặc định, trang Giới thiệu mặc định; chưa có sản phẩm, banner, bài viết,
// chính sách (admin có nút "nội dung soạn sẵn" cho 3 chính sách), chưa có đơn hàng.
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

if (existsSync('.env')) process.loadEnvFile('.env');

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  fail('Không chạy khi NODE_ENV=production. Nếu chắc chắn muốn xoá database demo, chạy với NODE_ENV=development.');
}

let host = '';
try {
  host = new URL(process.env.DATABASE_URL ?? '').hostname;
} catch {
  fail('DATABASE_URL không hợp lệ hoặc chưa đặt (apps/api/.env).');
}
const isLocal = ['localhost', '127.0.0.1', '::1', '[::1]', 'postgres'].includes(host);
if (!isLocal && process.env.RESET_ALLOW_REMOTE !== '1') {
  fail(`DATABASE_URL trỏ tới máy "${host}" (không phải máy cục bộ). Nếu đúng là database demo cần xoá sạch, chạy lại với RESET_ALLOW_REMOTE=1.`);
}
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  fail('Cần ADMIN_EMAIL và ADMIN_PASSWORD (mật khẩu ≥ 12 ký tự) để tạo tài khoản chủ cửa hàng sau khi xoá.');
}

const run = (command: string) => execSync(command, { stdio: 'inherit', env: process.env });

console.log(`\n▶ Xoá toàn bộ dữ liệu và chạy lại migration trên ${host}…`);
run('npx prisma migrate reset --force --skip-seed');

// Ảnh đã tải lên không còn bản ghi nào trỏ tới → xoá luôn cho sạch (chỉ trên máy đang chạy lệnh).
const uploadRoot = process.env.UPLOAD_DIR ?? 'uploads';
const uploadDir = isAbsolute(uploadRoot) ? uploadRoot : resolve(process.cwd(), uploadRoot);
if (existsSync(uploadDir)) {
  rmSync(uploadDir, { recursive: true, force: true });
  console.log(`▶ Đã xoá thư mục ảnh ${uploadDir}`);
}

console.log('▶ Tạo tài khoản ADMIN…');
run('npx tsx prisma/create-admin.ts');

console.log(`
✔ Database sạch đã sẵn sàng.
  Đăng nhập trang quản trị bằng ${process.env.ADMIN_EMAIL}, rồi:
  1. Thông tin cửa hàng → kiểm tra hotline, địa chỉ, link bản đồ, Facebook.
  2. Chính sách → bấm các nút "nội dung soạn sẵn" để tạo 3 chính sách.
  3. Danh mục → Sản phẩm → Banner → Bài viết.
  Web khách hàng tự làm mới sau tối đa 5 phút (hoặc ngay khi admin lưu, nếu đã cấu hình WEB_REVALIDATE_URL).
`);
