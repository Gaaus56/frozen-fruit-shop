"use server";

import type { LoginResponse } from "@frozen-fruit-shop/types";
import { API_URL } from "@/lib/api";
import { setToken } from "@/lib/session";
import { homePathFor } from "@/lib/nav";

export type LoginState = { error?: string; redirectTo?: string } | undefined;

/**
 * Đăng nhập thành công → trả về trang đích (không redirect ngay) để form chạy hiệu ứng rời màn hình
 * rồi mới chuyển trang (login-form.tsx).
 */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { error: "Không kết nối được máy chủ API. Vui lòng thử lại sau." };
  }

  const body = (await res.json().catch(() => null)) as (LoginResponse & { message?: string | string[] }) | null;
  if (!res.ok || !body?.accessToken) {
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    return { error: message ?? "Email hoặc mật khẩu không đúng." };
  }

  await setToken(body.accessToken, body.expiresAt);
  // Vào thẳng mục đầu tiên tài khoản được phép (nhân viên có thể không có quyền Đơn hàng).
  return { redirectTo: homePathFor(body.user) };
}
