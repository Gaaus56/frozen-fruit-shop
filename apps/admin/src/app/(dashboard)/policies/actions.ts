"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, runAction, type ActionState } from "@/lib/api";
import { checked, int, text } from "@/lib/format";

function payload(formData: FormData) {
  return {
    title: text(formData, "title"),
    slug: text(formData, "slug") || undefined,
    content: String(formData.get("content") ?? ""),
    sortOrder: int(formData, "sortOrder") ?? 0,
    isActive: checked(formData, "isActive"),
  };
}

export async function savePolicyAction(id: string | null, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(() =>
    id
      ? api(`/admin/policies/${id}`, { method: "PATCH", json: payload(formData) })
      : api("/admin/policies", { method: "POST", json: payload(formData) }),
  );
  if (result.error) return result;
  revalidatePath("/policies");
  redirect("/policies");
}

export async function deletePolicyAction(id: string) {
  const result = await runAction(() => api(`/admin/policies/${id}`, { method: "DELETE" }));
  revalidatePath("/policies");
  return result;
}
