import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { AuthUser } from "@frozen-fruit-shop/types";
import { api } from "./api";

/** Người đang đăng nhập — gọi API /auth/me một lần cho mỗi request (React cache). */
export const getCurrentUser = cache(async (): Promise<AuthUser> => api<AuthUser>("/auth/me"));

/** Chặn trang chỉ dành cho ADMIN (tổng quan bán hàng, tài khoản, cài đặt cửa hàng). */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") redirect("/orders?forbidden=1");
  return user;
}
