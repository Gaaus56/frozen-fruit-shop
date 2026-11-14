"use server";

import { revalidatePath } from "next/cache";
import { BANNER_PLACEMENTS } from "@frozen-fruit-shop/types";
import { redirect } from "next/navigation";
import { api, runAction, type ActionState } from "@/lib/api";
import { checked, int, text } from "@/lib/format";

export async function saveBannerAction(id: string | null, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  // Banner đầu trang Sản phẩm / Tin tức chỉ là ảnh nền: không có liên kết / nút bấm.
  const placement = BANNER_PLACEMENTS.find((value) => value === text(formData, "placement")) ?? "home";
  const isHome = placement === "home";
  const data = {
    placement,
    image: text(formData, "image"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    linkUrl: isHome ? text(formData, "linkUrl") || null : null,
    ctaLabel: isHome ? text(formData, "ctaLabel") || null : null,
    sortOrder: int(formData, "sortOrder") ?? 0,
    isActive: checked(formData, "isActive"),
  };
  if (!data.image) return { error: "Vui lòng tải ảnh banner." };

  const result = await runAction(() =>
    id ? api(`/admin/banners/${id}`, { method: "PATCH", json: data }) : api("/admin/banners", { method: "POST", json: data }),
  );
  if (result.error) return result;
  revalidatePath("/banners");
  redirect("/banners");
}

export async function deleteBannerAction(id: string) {
  const result = await runAction(() => api(`/admin/banners/${id}`, { method: "DELETE" }));
  revalidatePath("/banners");
  return result;
}
