import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import type { AuthUser, LoginResponse } from '@frozen-fruit-shop/types';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ChangePasswordDto, LoginDto } from './auth.dto.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function toAuthUser(user: Pick<User, 'id' | 'email' | 'name' | 'role'>): AuthUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
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
   * Đăng nhập bằng email + mật khẩu. Sai 5 lần liên tiếp thì khoá tài khoản 15 phút.
   *
   * Điểm mở rộng OTP (sau này): với role ADMIN, thay vì trả token ngay thì trả
   * `{ otpRequired: true, challengeId }`, gửi mã qua email/SMS và phát hành token ở endpoint
   * `POST /auth/verify-otp`. Tài khoản STAFF giữ nguyên luồng hiện tại (không cần OTP).
   */
  async login({ email, password }: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const invalid = new UnauthorizedException('Email hoặc mật khẩu không đúng.');

    if (!user) {
      await bcrypt.compare(password, this.dummyHash);
      throw invalid;
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      throw new UnauthorizedException(`Tài khoản tạm khoá do nhập sai nhiều lần. Thử lại sau ${minutes} phút.`);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const failed = user.failedLoginCount + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: failed >= MAX_FAILED_ATTEMPTS ? 0 : failed,
          lockedUntil: failed >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
        },
      });
      throw invalid;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên.');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    return this.issueToken(updated);
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return toAuthUser(user);
  }

  /** Đổi mật khẩu của chính mình. Các phiên đăng nhập cũ (thiết bị khác) bị đăng xuất. */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<LoginResponse> {
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
    return this.issueToken(updated);
  }

  private async issueToken(user: User): Promise<LoginResponse> {
    const accessToken = await this.jwtService.signAsync({ sub: user.id, role: user.role });
    const { exp } = this.jwtService.decode<{ exp: number }>(accessToken);
    return { accessToken, expiresAt: new Date(exp * 1000).toISOString(), user: toAuthUser(user) };
  }
}
