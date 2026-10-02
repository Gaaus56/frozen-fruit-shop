"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, runAction, type ActionState } from "@/lib/api";
import { checked, int, text } from "@/lib/format";

export async function saveBannerAction(id: string | null, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const data = {
    image: text(formData, "image"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    linkUrl: text(formData, "linkUrl") || null,
    ctaLabel: text(formData, "ctaLabel") || null,
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
