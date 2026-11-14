import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { STAFF_PERMISSIONS } from '@frozen-fruit-shop/types';
import { AuthGuard, effectivePermissions } from '../src/auth/auth.guard.js';

const SECRET = 'unit-test-secret-for-auth-guard-0123456789';
const jwt = new JwtService({ secret: SECRET });

type User = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
  permissions: string[];
  passwordChangedAt: Date;
};

const baseUser: User = {
  id: 'u1',
  email: 'staff@shop.vn',
  name: 'Nhân viên',
  role: 'STAFF',
  isActive: true,
  permissions: [],
  passwordChangedAt: new Date('2026-01-01T00:00:00Z'),
};

/** Dựng guard với user trong "CSDL" và metadata @Auth()/@Permission() của endpoint. */
function guardFor(user: User | null, meta: { roles?: string[]; permissions?: string[] } = {}) {
  const prisma: any = { user: { findUnique: async () => user } };
  const reflector = {
    getAllAndOverride: (key: string) => (key === 'roles' ? meta.roles : meta.permissions),
  } as unknown as Reflector;
  return new AuthGuard(jwt, prisma, reflector);
}

function context(authorization?: string) {
  const request: any = { headers: authorization ? { authorization } : {} };
  return {
    request,
    ctx: {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => undefined,
      getClass: () => undefined,
    } as any,
  };
}

async function tokenFor(userId: string, iatSeconds = Math.floor(Date.now() / 1000), secret = SECRET) {
  return `Bearer ${await jwt.signAsync({ sub: userId, role: 'STAFF', iat: iatSeconds }, { secret })}`;
}

test('token hợp lệ → cho qua và gắn request.user (không chứa passwordHash)', async () => {
  const { request, ctx } = context(await tokenFor('u1'));
  assert.equal(await guardFor(baseUser).canActivate(ctx), true);
  assert.deepEqual(Object.keys(request.user).sort(), ['email', 'id', 'name', 'permissions', 'role']);
});

test('không có token / sai scheme → 401', async () => {
  await assert.rejects(guardFor(baseUser).canActivate(context().ctx), UnauthorizedException);
  await assert.rejects(guardFor(baseUser).canActivate(context('Basic abc').ctx), UnauthorizedException);
});

test('token ký bằng secret khác → 401', async () => {
  const { ctx } = context(await tokenFor('u1', undefined, 'another-secret-another-secret-another!!'));
  await assert.rejects(guardFor(baseUser).canActivate(ctx), UnauthorizedException);
});

test('tài khoản đã bị xoá → 401', async () => {
  await assert.rejects(guardFor(null).canActivate(context(await tokenFor('u1')).ctx), UnauthorizedException);
});

test('tài khoản bị khoá → token cũ mất hiệu lực ngay (401)', async () => {
  const { ctx } = context(await tokenFor('u1'));
  await assert.rejects(guardFor({ ...baseUser, isActive: false }).canActivate(ctx), UnauthorizedException);
});

test('đổi mật khẩu → mọi token cấp TRƯỚC thời điểm đổi bị thu hồi (401)', async () => {
  const changedAt = new Date('2026-11-14T10:00:00Z');
  const before = await tokenFor('u1', Math.floor(changedAt.getTime() / 1000) - 60);
  const after = await tokenFor('u1', Math.floor(changedAt.getTime() / 1000) + 60);
  const user = { ...baseUser, passwordChangedAt: changedAt };
  await assert.rejects(guardFor(user).canActivate(context(before).ctx), UnauthorizedException);
  assert.equal(await guardFor(user).canActivate(context(after).ctx), true);
});

test('@Auth("ADMIN"): nhân viên STAFF bị chặn (403), ADMIN qua', async () => {
  const token = await tokenFor('u1');
  await assert.rejects(guardFor(baseUser, { roles: ['ADMIN'] }).canActivate(context(token).ctx), ForbiddenException);
  assert.equal(await guardFor({ ...baseUser, role: 'ADMIN' }, { roles: ['ADMIN'] }).canActivate(context(token).ctx), true);
});

test('@Permission: nhân viên thiếu quyền → 403; có ít nhất một quyền yêu cầu → qua', async () => {
  const [p1, p2] = STAFF_PERMISSIONS;
  const token = await tokenFor('u1');
  await assert.rejects(
    guardFor({ ...baseUser, permissions: [] }, { permissions: [p1] }).canActivate(context(token).ctx),
    ForbiddenException,
  );
  assert.equal(
    await guardFor({ ...baseUser, permissions: [p2] }, { permissions: [p1, p2] }).canActivate(context(token).ctx),
    true,
  );
});

test('quyền đọc lại từ CSDL mỗi request: admin bỏ quyền là nhân viên mất quyền ngay', async () => {
  const [p1] = STAFF_PERMISSIONS;
  const token = await tokenFor('u1');
  const guard = guardFor({ ...baseUser, permissions: [] }, { permissions: [p1] });
  await assert.rejects(guard.canActivate(context(token).ctx), ForbiddenException);
});

test('effectivePermissions: ADMIN có đủ mọi quyền; STAFF chỉ giữ quyền hợp lệ, bỏ giá trị lạ', () => {
  assert.deepEqual(effectivePermissions({ role: 'ADMIN', permissions: [] }), [...STAFF_PERMISSIONS]);
  const [p1] = STAFF_PERMISSIONS;
  assert.deepEqual(effectivePermissions({ role: 'STAFF', permissions: [p1, 'hack:everything'] }), [p1]);
});
