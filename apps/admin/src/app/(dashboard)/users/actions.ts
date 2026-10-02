"use server";

import { revalidatePath } from "next/cache";
import { api, runAction, type ActionState } from "@/lib/api";
import { text } from "@/lib/format";

export async function createStaffAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    () =>
      api("/admin/users", {
        method: "POST",
        json: { name: text(formData, "name"), email: text(formData, "email"), password: String(formData.get("password") ?? "") },
      }),
    "Đã tạo tài khoản. Gửi email và mật khẩu cho nhân viên để đăng nhập.",
  );
  revalidatePath("/users");
  return result;
}

export async function setStaffActiveAction(id: string, isActive: boolean) {
  const result = await runAction(() => api(`/admin/users/${id}`, { method: "PATCH", json: { isActive } }));
  revalidatePath("/users");
  return result;
}

export async function resetStaffPasswordAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    () => api(`/admin/users/${id}/reset-password`, { method: "POST", json: { password: String(formData.get("password") ?? "") } }),
    "Đã đặt mật khẩu mới. Nhân viên bị đăng xuất khỏi mọi thiết bị.",
  );
  return result;
}

export async function deleteStaffAction(id: string) {
  const result = await runAction(() => api(`/admin/users/${id}`, { method: "DELETE" }));
  revalidatePath("/users");
  return result;
}
