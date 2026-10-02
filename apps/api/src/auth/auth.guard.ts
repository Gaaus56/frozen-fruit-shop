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
}

const ROLES_KEY = 'roles';

/**
 * Bảo vệ endpoint quản trị. Không truyền vai trò = mọi tài khoản đã đăng nhập (ADMIN, STAFF).
 * Ví dụ: `@Auth('ADMIN')` chỉ cho tài khoản ADMIN.
 */
export function Auth(...roles: Role[]) {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(AuthGuard));
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

    request.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    return true;
  }
}
