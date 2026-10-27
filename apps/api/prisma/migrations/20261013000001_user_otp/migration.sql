-- Xác thực 2 lớp (OTP qua app Google / Microsoft Authenticator) cho tài khoản quản trị.
ALTER TABLE "users" ADD COLUMN "otpSecret" TEXT;
ALTER TABLE "users" ADD COLUMN "otpPendingSecret" TEXT;
ALTER TABLE "users" ADD COLUMN "otpEnabledAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "otpLastTimeStep" INTEGER;
ALTER TABLE "users" ADD COLUMN "otpRecoveryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
