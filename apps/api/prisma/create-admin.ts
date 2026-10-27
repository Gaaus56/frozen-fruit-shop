// Tạo tài khoản ADMIN duy nhất, hoặc đặt lại mật khẩu cho tài khoản ADMIN hiện có.
// Chạy trên máy chủ (không có API công khai nào tạo được ADMIN):
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
// Hoặc điền ADMIN_EMAIL / ADMIN_PASSWORD trong apps/api/.env rồi chạy `npm run admin:create`.
// Mất điện thoại + mất cả mã dự phòng OTP: thêm ADMIN_RESET_OTP=1 để tắt xác thực 2 lớp, đăng nhập rồi bật lại.
import { existsSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

if (existsSync('.env')) process.loadEnvFile('.env');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? '';
  const name = process.env.ADMIN_NAME?.trim() || 'Chủ cửa hàng';

  if (!email || !password) {
    throw new Error('Cần đặt ADMIN_EMAIL và ADMIN_PASSWORD (trong môi trường hoặc apps/api/.env).');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD phải dài ít nhất 12 ký tự.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (existingAdmin && existingAdmin.email !== email) {
    throw new Error(
      `Đã có tài khoản ADMIN (${existingAdmin.email}). Hệ thống chỉ cho phép một ADMIN — ` +
        'dùng đúng email đó để đặt lại mật khẩu.',
    );
  }

  const staffWithEmail = await prisma.user.findUnique({ where: { email } });
  if (!existingAdmin && staffWithEmail) {
    throw new Error(`Email ${email} đang là tài khoản nhân viên. Hãy dùng email khác cho ADMIN.`);
  }

  if (existingAdmin) {
    const resetOtp = process.env.ADMIN_RESET_OTP === '1';
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        passwordHash,
        name,
        isActive: true,
        passwordChangedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
        ...(resetOtp
          ? { otpSecret: null, otpPendingSecret: null, otpEnabledAt: null, otpLastTimeStep: null, otpRecoveryCodes: [] }
          : {}),
      },
    });
    console.log(`Đã đặt lại mật khẩu cho ADMIN ${email}.${resetOtp ? ' Đã tắt xác thực 2 lớp (OTP).' : ''}`);
  } else {
    await prisma.user.create({ data: { email, name, passwordHash, role: 'ADMIN' } });
    console.log(`Đã tạo tài khoản ADMIN ${email}.`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
