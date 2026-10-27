import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import type { AuthUser, LoginResponse, OtpChallenge, OtpRecoveryCodes, OtpSetup, OtpStatus } from '@frozen-fruit-shop/types';
import { iso } from '../common/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { effectivePermissions, type JwtPayload } from './auth.guard.js';
import type { ChangePasswordDto, LoginDto, OtpCodeDto, OtpDisableDto, OtpLoginDto, PasswordConfirmDto } from './auth.dto.js';
import { createOtpSetup, encryptSecret, generateRecoveryCodes, useRecoveryCode, verifyTotp } from './otp.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const BCRYPT_ROUNDS = 12;
/** Thời gian được nhập mã OTP sau khi đúng mật khẩu. */
const OTP_CHALLENGE_MINUTES = 5;
const OTP_CHALLENGE = 'otp-challenge';

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function toAuthUser(user: Pick<User, 'id' | 'email' | 'name' | 'role' | 'permissions' | 'otpEnabledAt'>): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: effectivePermissions(user),
    otpEnabled: Boolean(user.otpEnabledAt),
  };
}

@Injectable()
export class AuthService {
  // Hash giả để so sánh khi email không tồn tại — thời gian phản hồi như nhau, không lộ email nào có thật.
  private readonly dummyHash = bcrypt.hashSync('dummy-password', 10);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Bước 1 — email + mật khẩu. Sai 5 lần liên tiếp thì khoá tài khoản 15 phút.
   * Tài khoản đã bật OTP: không phát token ngay mà trả `{ otpRequired, otpToken }` để nhập mã (bước 2).
   */
  async login({ email, password }: LoginDto): Promise<LoginResponse | OtpChallenge> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const invalid = new UnauthorizedException('Email hoặc mật khẩu không đúng.');

    if (!user) {
      await bcrypt.compare(password, this.dummyHash);
      throw invalid;
    }
    this.assertNotLocked(user);

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      await this.recordFailure(user);
      throw invalid;
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên.');
    }

    if (user.otpEnabledAt) {
      // Chưa xoá số lần sai: đúng mật khẩu rồi đoán mã OTP sai vẫn bị tính, tránh dò mã bằng cách đăng nhập lại liên tục.
      const otpToken = await this.jwtService.signAsync({ sub: user.id, typ: OTP_CHALLENGE }, { expiresIn: `${OTP_CHALLENGE_MINUTES}m` });
      return { otpRequired: true, otpToken, expiresAt: new Date(Date.now() + OTP_CHALLENGE_MINUTES * 60_000).toISOString() };
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    return this.issueToken(updated, null);
  }

  /** Bước 2 — mã 6 số trong app (hoặc một mã dự phòng). Sai cũng tính vào giới hạn 5 lần như mật khẩu. */
  async loginWithOtp({ otpToken, code }: OtpLoginDto): Promise<LoginResponse> {
    const expired = new UnauthorizedException('Phiên nhập mã đã hết hạn, vui lòng đăng nhập lại từ đầu.');
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(otpToken);
    } catch {
      throw expired;
    }
    if (payload.typ !== OTP_CHALLENGE) throw expired;

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || !user.otpEnabledAt || !user.otpSecret || payload.iat * 1000 < user.passwordChangedAt.getTime() - 1000) {
      throw expired;
    }
    this.assertNotLocked(user);

    const verified = await this.checkCode(user, code);
    if (!verified) {
      await this.recordFailure(user);
      throw new UnauthorizedException('Mã OTP không đúng hoặc đã dùng. Mở app xác thực và nhập mã mới nhất.');
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { ...verified, failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    return this.issueToken(updated, Date.now());
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return toAuthUser(user);
  }

  /** Đổi mật khẩu của chính mình. Các phiên đăng nhập cũ (thiết bị khác) bị đăng xuất. */
  async changePassword(userId: string, dto: ChangePasswordDto, otpVerifiedAt: number | null): Promise<LoginResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng.');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại.');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(dto.newPassword), passwordChangedAt: new Date() },
    });
    return this.issueToken(updated, otpVerifiedAt);
  }

  // ─────────── Xác thực 2 lớp (OTP) ───────────

  async otpStatus(userId: string): Promise<OtpStatus> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return { enabled: Boolean(user.otpEnabledAt), enabledAt: iso(user.otpEnabledAt), recoveryCodesLeft: user.otpRecoveryCodes.length };
  }

  /** Bật OTP bước 1: nhập lại mật khẩu → tạo khoá mới (chờ xác nhận) + mã QR. */
  async otpSetup(userId: string, { password }: PasswordConfirmDto): Promise<OtpSetup> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.otpEnabledAt) throw new BadRequestException('Xác thực 2 lớp đang bật. Tắt đi trước nếu muốn đổi điện thoại.');
    await this.assertPassword(user, password);
    const setup = await createOtpSetup(user.email);
    await this.prisma.user.update({ where: { id: userId }, data: { otpPendingSecret: encryptSecret(setup.secret) } });
    return setup;
  }

  /** Bật OTP bước 2: nhập đúng mã trong app → bật, trả 8 mã dự phòng + token mới (đã xác thực OTP). */
  async otpEnable(userId: string, { code }: OtpCodeDto): Promise<LoginResponse & OtpRecoveryCodes> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.otpEnabledAt) throw new BadRequestException('Xác thực 2 lớp đã bật.');
    if (!user.otpPendingSecret) throw new BadRequestException('Chưa tạo mã QR. Bấm "Bật xác thực 2 lớp" để bắt đầu lại.');
    const timeStep = await verifyTotp(user.otpPendingSecret, code, null);
    if (timeStep === null) throw new BadRequestException('Mã không đúng. Kiểm tra giờ trên điện thoại và nhập mã mới nhất trong app.');

    const { codes, hashes } = generateRecoveryCodes();
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        otpSecret: user.otpPendingSecret,
        otpPendingSecret: null,
        otpEnabledAt: new Date(),
        otpLastTimeStep: timeStep,
        otpRecoveryCodes: hashes,
      },
    });
    await this.logOtpChange(updated, 'otp-enable');
    return { ...(await this.issueToken(updated, Date.now())), recoveryCodes: codes };
  }

  /** Tắt OTP: cần cả mật khẩu và mã OTP (hoặc mã dự phòng). */
  async otpDisable(userId: string, { password, code }: OtpDisableDto): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.otpEnabledAt) throw new BadRequestException('Xác thực 2 lớp đang tắt.');
    await this.assertPassword(user, password);
    if (!(await this.checkCode(user, code))) throw new BadRequestException('Mã OTP không đúng hoặc đã dùng.');
    await this.prisma.user.update({ where: { id: userId }, data: clearOtp });
    await this.logOtpChange(user, 'otp-disable');
  }

  /** Tạo lại 8 mã dự phòng (mã cũ hết hiệu lực). */
  async otpRegenerateRecoveryCodes(userId: string, { code }: OtpCodeDto): Promise<OtpRecoveryCodes> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.otpEnabledAt || !user.otpSecret) throw new BadRequestException('Xác thực 2 lớp đang tắt.');
    const timeStep = await verifyTotp(user.otpSecret, code, user.otpLastTimeStep);
    if (timeStep === null) throw new BadRequestException('Mã OTP không đúng hoặc đã dùng.');
    const { codes, hashes } = generateRecoveryCodes();
    await this.prisma.user.update({ where: { id: userId }, data: { otpRecoveryCodes: hashes, otpLastTimeStep: timeStep } });
    return { recoveryCodes: codes };
  }

  /** Nhập lại mã cho thao tác nhạy cảm → token mới ghi mốc vừa xác thực (dùng OTP_STEP_UP_MINUTES phút). */
  async otpStepUp(userId: string, { code }: OtpCodeDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.otpEnabledAt || !user.otpSecret) throw new BadRequestException('Xác thực 2 lớp đang tắt.');
    this.assertNotLocked(user);
    const verified = await this.checkCode(user, code);
    if (!verified) {
      await this.recordFailure(user);
      throw new BadRequestException('Mã OTP không đúng hoặc đã dùng.');
    }
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { ...verified, failedLoginCount: 0 } });
    return this.issueToken(updated, Date.now());
  }

  // ─────────── Nội bộ ───────────

  /**
   * Mã 6 số (chặn dùng lại mã cũ) hoặc mã dự phòng (dùng xong bị xoá).
   * Đúng → các trường cần lưu (bước thời gian / danh sách mã dự phòng còn lại); sai → null.
   */
  private async checkCode(user: User, code: string): Promise<Partial<Pick<User, 'otpLastTimeStep' | 'otpRecoveryCodes'>> | null> {
    if (!user.otpSecret) return null;
    const timeStep = await verifyTotp(user.otpSecret, code, user.otpLastTimeStep);
    if (timeStep !== null) return { otpLastTimeStep: timeStep };
    const remaining = useRecoveryCode(user.otpRecoveryCodes, code);
    return remaining ? { otpRecoveryCodes: remaining } : null;
  }

  /** Bật / tắt OTP của chính mình (đường /auth/* nên không qua bộ ghi lịch sử tự động) → ghi tay vào Lịch sử chỉnh sửa. */
  private async logOtpChange(user: User, action: 'otp-enable' | 'otp-disable') {
    await this.prisma.auditLog
      .create({
        data: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          action,
          resource: 'users',
          entityId: user.id,
          entityLabel: `${user.name} (${user.email})`,
          changes: [],
        },
      })
      .catch(() => undefined);
  }

  private assertNotLocked(user: User) {
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      throw new UnauthorizedException(`Tài khoản tạm khoá do nhập sai nhiều lần. Thử lại sau ${minutes} phút.`);
    }
  }

  private async assertPassword(user: User, password: string) {
    if (!(await bcrypt.compare(password, user.passwordHash))) throw new BadRequestException('Mật khẩu không đúng.');
  }

  /** Sai mật khẩu / mã OTP: cộng dồn, đủ 5 lần thì khoá 15 phút. */
  private async recordFailure(user: User) {
    const failed = user.failedLoginCount + 1;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: failed >= MAX_FAILED_ATTEMPTS ? 0 : failed,
        lockedUntil: failed >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      },
    });
  }

  /** `otpVerifiedAt` (ms): mốc phiên này nhập đúng OTP — giữ qua token mới để không phải nhập lại ngay. */
  private async issueToken(user: User, otpVerifiedAt: number | null): Promise<LoginResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      ...(otpVerifiedAt ? { otp: Math.floor(otpVerifiedAt / 1000) } : {}),
    });
    const { exp } = this.jwtService.decode<{ exp: number }>(accessToken);
    return { accessToken, expiresAt: new Date(exp * 1000).toISOString(), user: toAuthUser(user) };
  }
}

/** Dữ liệu xoá sạch OTP của một tài khoản (tự tắt, hoặc chủ cửa hàng tắt giúp nhân viên mất điện thoại). */
export const clearOtp = {
  otpSecret: null,
  otpPendingSecret: null,
  otpEnabledAt: null,
  otpLastTimeStep: null,
  otpRecoveryCodes: [],
} satisfies Partial<User>;
