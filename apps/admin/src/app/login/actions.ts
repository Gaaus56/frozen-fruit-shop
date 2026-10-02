"use server";

import { redirect } from "next/navigation";
import type { LoginResponse } from "@frozen-fruit-shop/types";
import { API_URL } from "@/lib/api";
import { setToken } from "@/lib/session";

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
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
  redirect(body.user.role === "ADMIN" ? "/" : "/orders");
}
