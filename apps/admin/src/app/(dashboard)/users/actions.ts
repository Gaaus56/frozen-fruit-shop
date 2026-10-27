"use server";

import { revalidatePath } from "next/cache";
import { STAFF_PERMISSIONS, type StaffPermission } from "@frozen-fruit-shop/types";
import { api, runAction, type ActionState } from "@/lib/api";
import { text } from "@/lib/format";

/** Các ô quyền được tick (name="permissions"), bỏ giá trị lạ. */
function permissions(formData: FormData): StaffPermission[] {
  const picked = formData.getAll("permissions").map(String);
  return STAFF_PERMISSIONS.filter((permission) => picked.includes(permission));
}

export async function createStaffAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    () =>
      api("/admin/users", {
        method: "POST",
        json: {
          name: text(formData, "name"),
          email: text(formData, "email"),
          password: String(formData.get("password") ?? ""),
          permissions: permissions(formData),
        },
      }),
    "Đã tạo tài khoản. Gửi email và mật khẩu cho nhân viên để đăng nhập.",
  );
  revalidatePath("/users");
  return result;
}

export async function updateStaffPermissionsAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    () => api(`/admin/users/${id}`, { method: "PATCH", json: { permissions: permissions(formData) } }),
    "Đã lưu quyền. Có hiệu lực ngay ở lần thao tác tiếp theo của nhân viên.",
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

export async function resetStaffOtpAction(id: string) {
  const result = await runAction(() => api(`/admin/users/${id}/reset-otp`, { method: "POST" }), "Đã tắt xác thực 2 lớp của nhân viên.");
  revalidatePath("/users");
  return result;
}
