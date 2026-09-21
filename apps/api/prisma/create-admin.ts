// Tạo (hoặc đổi mật khẩu) tài khoản admin mà KHÔNG nạp dữ liệu mẫu — dùng cho môi trường chạy thật.
// Chạy: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run prisma:create-admin -w apps/api
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Cần đặt ADMIN_EMAIL và ADMIN_PASSWORD.');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD phải dài ít nhất 12 ký tự.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: 'Chủ cửa hàng' },
  });
  console.log(`Đã tạo/cập nhật admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
