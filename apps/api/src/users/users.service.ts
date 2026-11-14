import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { StaffAccount } from '@frozen-fruit-shop/types';
import { effectivePermissions } from '../auth/auth.guard.js';
import { hashPassword } from '../auth/auth.service.js';
import { iso } from '../common/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateStaffDto, ResetPasswordDto, UpdateStaffDto } from './users.dto.js';

function toStaffAccount(user: User): StaffAccount {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: effectivePermissions(user),
    isActive: user.isActive,
    lastLoginAt: iso(user.lastLoginAt),
    createdAt: iso(user.createdAt),
  };
}

/**
 * Quản lý tài khoản nhân viên (STAFF). API này không bao giờ tạo hay sửa tài khoản ADMIN —
 * tài khoản ADMIN duy nhất chỉ được tạo bằng lệnh `npm run admin:create` trên máy chủ.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<StaffAccount[]> {
    const users = await this.prisma.user.findMany({ orderBy: [{ role: 'asc' }, { createdAt: 'asc' }] });
    return users.map(toStaffAccount);
  }

  async create(dto: CreateStaffDto): Promise<StaffAccount> {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: 'STAFF',
        permissions: dto.permissions ?? [],
        passwordHash: await hashPassword(dto.password),
      },
    });
    return toStaffAccount(user);
  }

  async update(id: string, dto: UpdateStaffDto): Promise<StaffAccount> {
    await this.findStaff(id);
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    return toStaffAccount(user);
  }

  /** Đặt mật khẩu mới cho nhân viên; nhân viên bị đăng xuất khỏi mọi thiết bị. */
  async resetPassword(id: string, dto: ResetPasswordDto): Promise<StaffAccount> {
    await this.findStaff(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: await hashPassword(dto.password),
        passwordChangedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
    return toStaffAccount(user);
  }

  async remove(id: string): Promise<void> {
    await this.findStaff(id);
    await this.prisma.user.delete({ where: { id } });
  }

  private async findStaff(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'STAFF') {
      throw new NotFoundException('Không tìm thấy tài khoản nhân viên.');
    }
    return user;
  }
}
