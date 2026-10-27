import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

// Nạp apps/api/.env (nếu có) bằng tính năng có sẵn của Node, không cần thư viện dotenv.
// Biến đã đặt sẵn trong môi trường (Docker, CI) luôn được ưu tiên hơn file .env.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const isProduction = process.env.NODE_ENV === 'production';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}`);
  }
  return value;
}

function list(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

const jwtSecret = process.env.JWT_SECRET ?? (isProduction ? '' : 'dev-secret-change-me-dev-secret-change-me');
if (isProduction && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET phải dài ít nhất 32 ký tự khi chạy production.');
}

// Khoá mã hoá khoá bí mật OTP trong DB (32 byte, dạng base64 hoặc hex 64 ký tự). Chưa đặt → suy ra từ JWT_SECRET
// (vẫn mã hoá, nhưng đổi JWT_SECRET sẽ làm mọi OTP đã bật mất hiệu lực) — production nên đặt riêng.
const otpKeyRaw = process.env.OTP_ENCRYPTION_KEY ?? '';
const otpEncryptionKey = /^[0-9a-f]{64}$/i.test(otpKeyRaw)
  ? Buffer.from(otpKeyRaw, 'hex')
  : otpKeyRaw
    ? Buffer.from(otpKeyRaw, 'base64')
    : createHash('sha256').update(`otp-encryption:${jwtSecret}`).digest();
if (otpEncryptionKey.length !== 32) {
  throw new Error('OTP_ENCRYPTION_KEY phải là 32 byte (base64, hoặc hex 64 ký tự). Tạo bằng: openssl rand -base64 32');
}

const port = Number(process.env.PORT ?? 4000);
const uploadDir = process.env.UPLOAD_DIR ?? 'uploads';

export const env = {
  isProduction,
  port,
  databaseUrl: required('DATABASE_URL'),
  publicUrl: (process.env.PUBLIC_URL ?? `http://localhost:${port}`).replace(/\/$/, ''),
  corsOrigins: list(process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3002'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '12h',
  otpEncryptionKey,
  otpEncryptionKeyIsDerived: !otpKeyRaw,
  uploadDir: isAbsolute(uploadDir) ? uploadDir : resolve(process.cwd(), uploadDir),
  webRevalidateUrl: process.env.WEB_REVALIDATE_URL ?? '',
  revalidateSecret: process.env.REVALIDATE_SECRET ?? '',
} as const;
