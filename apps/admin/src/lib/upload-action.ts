"use server";

import { api } from "./api";

export type UploadResult = { url: string } | { error: string };

/** Nhận file ảnh từ trình duyệt rồi chuyển tiếp lên API (kèm token). Giới hạn dung lượng: 5MB. */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Chưa chọn file ảnh." };
  if (file.size > 5 * 1024 * 1024) return { error: "Ảnh vượt quá 5MB, vui lòng chọn ảnh nhỏ hơn." };

  const body = new FormData();
  body.append("file", file, file.name);
  try {
    const result = await api<{ url: string }>("/admin/uploads", { method: "POST", body });
    return { url: result.url };
  } catch (error) {
    if (error instanceof Error && "digest" in error) throw error;
    return { error: error instanceof Error ? error.message : "Tải ảnh thất bại." };
  }
}
