import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@prisma/client';
import { STAFF_PERMISSIONS, type StaffPermission } from '@frozen-fruit-shop/types';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';

export interface JwtPayload {
  sub: string;
  role: Role;
  iat: number;
}

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: StaffPermission[];
}

const ROLES_KEY = 'roles';
const PERMISSIONS_KEY = 'permissions';

/**
 * Bảo vệ endpoint quản trị. Không truyền vai trò = mọi tài khoản đã đăng nhập (ADMIN, STAFF).
 * Ví dụ: `@Auth('ADMIN')` chỉ cho tài khoản ADMIN.
 */
export function Auth(...roles: Role[]) {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(AuthGuard));
}

/**
 * Quyền nhân viên cần có (ít nhất một trong các quyền liệt kê). ADMIN luôn được qua.
 * Đặt ở controller (áp cho mọi endpoint) và ghi đè ở từng endpoint khi cần nới quyền, ví dụ danh sách sản phẩm
 * mở cho cả người soạn bài viết để chèn ô sản phẩm. Dùng kèm `@Auth()`.
 */
export function Permission(...permissions: StaffPermission[]) {
  return SetMetadata(PERMISSIONS_KEY, permissions);
}

/** Quyền hợp lệ đang lưu cho tài khoản (bỏ giá trị lạ); ADMIN có đủ mọi quyền. */
export function effectivePermissions(user: { role: Role; permissions: string[] }): StaffPermission[] {
  if (user.role === 'ADMIN') return [...STAFF_PERMISSIONS];
  return STAFF_PERMISSIONS.filter((permission) => user.permissions.includes(permission));
}

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<Request>().user as RequestUser;
});

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bạn cần đăng nhập để thực hiện thao tác này.');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    }

    // Kiểm tra lại trong DB ở mỗi request để khoá/xoá tài khoản hoặc đổi mật khẩu có hiệu lực ngay.
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    const issuedAt = payload.iat * 1000;
    if (!user || !user.isActive || issuedAt < user.passwordChangedAt.getTime() - 1000) {
      throw new UnauthorizedException('Phiên đăng nhập không còn hiệu lực, vui lòng đăng nhập lại.');
    }

    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles && roles.length > 0 && !roles.includes(user.role)) {
      throw new ForbiddenException('Tài khoản của bạn không có quyền truy cập chức năng này.');
    }

    // Quyền đọc lại từ DB ở mỗi request → admin bỏ quyền là có hiệu lực ngay, không cần nhân viên đăng nhập lại.
    const permissions = effectivePermissions(user);
    const required = this.reflector.getAllAndOverride<StaffPermission[] | undefined>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (required && required.length > 0 && !required.some((permission) => permissions.includes(permission))) {
      throw new ForbiddenException('Tài khoản của bạn chưa được cấp quyền cho mục này. Liên hệ chủ cửa hàng để được cấp quyền.');
    }

    request.user = { id: user.id, email: user.email, name: user.name, role: user.role, permissions };
    return true;
  }
}
