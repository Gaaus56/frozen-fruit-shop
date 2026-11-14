// Nạp TRƯỚC mọi file test (node --import ./test/setup.ts): src/config/env.ts đọc biến môi trường ngay khi
// được import. Unit test không kết nối CSDL thật — Prisma luôn được thay bằng object giả trong từng test.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://unit:test@127.0.0.1:1/unit';
process.env.JWT_SECRET ??= 'unit-test-secret-for-auth-guard-0123456789';
