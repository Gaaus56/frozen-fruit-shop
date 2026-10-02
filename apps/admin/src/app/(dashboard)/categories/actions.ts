"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, runAction, type ActionState } from "@/lib/api";
import { checked, int, text } from "@/lib/format";

function payload(formData: FormData) {
  return {
    name: text(formData, "name"),
    slug: text(formData, "slug") || undefined,
    description: text(formData, "description"),
    image: text(formData, "image") || null,
    sortOrder: int(formData, "sortOrder") ?? 0,
    isActive: checked(formData, "isActive"),
  };
}

export async function saveCategoryAction(id: string | null, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(() =>
    id
      ? api(`/admin/categories/${id}`, { method: "PATCH", json: payload(formData) })
      : api("/admin/categories", { method: "POST", json: payload(formData) }),
  );
  if (result.error) return result;
  revalidatePath("/categories");
  redirect("/categories");
}

export async function deleteCategoryAction(id: string) {
  const result = await runAction(() => api(`/admin/categories/${id}`, { method: "DELETE" }));
  revalidatePath("/categories");
  return result;
}
