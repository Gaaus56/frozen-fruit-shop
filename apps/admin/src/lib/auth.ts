import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { hasPermission, type AuthUser, type StaffPermission } from "@frozen-fruit-shop/types";
import { api } from "./api";
import { homePathFor } from "./nav";

/** Người đang đăng nhập — gọi API /auth/me một lần cho mỗi request (React cache). */
export const getCurrentUser = cache(async (): Promise<AuthUser> => api<AuthUser>("/auth/me"));

/** Đưa về mục đầu tiên tài khoản được vào, kèm thông báo "không có quyền" (ForbiddenNotice). */
function denyAccess(user: AuthUser): never {
  redirect(`${homePathFor(user)}?forbidden=1`);
}

/** Chặn trang chỉ dành cho ADMIN (tổng quan bán hàng, tài khoản, cài đặt cửa hàng, xem trước & sửa). */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") denyAccess(user);
  return user;
}

/** Chặn mục nhân viên chưa được cấp quyền (admin cấp ở "Tài khoản nhân viên"). API cũng chặn lại lần nữa. */
export async function requirePermission(permission: StaffPermission): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!hasPermission(user, permission)) denyAccess(user);
  return user;
}
