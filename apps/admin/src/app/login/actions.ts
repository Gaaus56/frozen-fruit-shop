"use server";

import type { LoginResponse, OtpChallenge } from "@frozen-fruit-shop/types";
import { API_URL } from "@/lib/api";
import { setToken } from "@/lib/session";
import { homePathFor } from "@/lib/nav";

/** `otpToken`: đúng mật khẩu, tài khoản đã bật OTP → form chuyển sang bước nhập mã. */
export type LoginState = { error?: string; redirectTo?: string; otpToken?: string } | undefined;

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

  return finishLogin(res, "Email hoặc mật khẩu không đúng.");
}

/** Bước 2: mã 6 số trong app xác thực (hoặc mã dự phòng). */
export async function loginOtpAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const otpToken = String(formData.get("otpToken") ?? "");
  const code = String(formData.get("code") ?? "");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login/otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ otpToken, code }),
      cache: "no-store",
    });
  } catch {
    return { error: "Không kết nối được máy chủ API. Vui lòng thử lại sau.", otpToken };
  }
  const state = await finishLogin(res, "Mã OTP không đúng.");
  // Sai mã → ở lại bước nhập mã. Phiên nhập mã hết hạn / tài khoản bị khoá tạm → quay về bước mật khẩu.
  const wrongCode = Boolean(state?.error?.startsWith("Mã OTP"));
  return wrongCode ? { ...state, otpToken } : state;
}

async function finishLogin(res: Response, fallback: string): Promise<LoginState> {
  const body = (await res.json().catch(() => null)) as (Partial<LoginResponse & OtpChallenge> & { message?: string | string[] }) | null;
  if (res.ok && body?.otpRequired && body.otpToken) return { otpToken: body.otpToken };
  if (!res.ok || !body?.accessToken || !body.expiresAt || !body.user) {
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    return { error: message ?? fallback };
  }

  await setToken(body.accessToken, body.expiresAt);
  // Vào thẳng mục đầu tiên tài khoản được phép (nhân viên có thể không có quyền Đơn hàng).
  return { redirectTo: homePathFor(body.user) };
}
