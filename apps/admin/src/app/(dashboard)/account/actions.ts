"use server";

import type { LoginResponse } from "@frozen-fruit-shop/types";
import { api, runAction, type ActionState } from "@/lib/api";
import { setToken } from "@/lib/session";

export async function changePasswordAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword !== String(formData.get("confirmPassword") ?? "")) {
    return { error: "Mật khẩu nhập lại không khớp." };
  }

  return runAction(async () => {
    // Đổi mật khẩu làm mọi token cũ hết hiệu lực → lưu ngay token mới để phiên hiện tại tiếp tục.
    const session = await api<LoginResponse>("/auth/change-password", {
      method: "POST",
      json: { currentPassword: String(formData.get("currentPassword") ?? ""), newPassword },
    });
    await setToken(session.accessToken, session.expiresAt);
  }, "Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.");
}
