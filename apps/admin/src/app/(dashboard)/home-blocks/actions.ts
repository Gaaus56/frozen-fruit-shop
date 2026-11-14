"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HOME_BLOCK_POSITIONS } from "@frozen-fruit-shop/types";
import { api, runAction, type ActionState } from "@/lib/api";
import { checked, int, text } from "@/lib/format";

function payload(formData: FormData) {
  return {
    title: text(formData, "title"),
    content: String(formData.get("content") ?? ""),
    framed: checked(formData, "framed"),
    position: HOME_BLOCK_POSITIONS.find((value) => value === text(formData, "position")) ?? "after_hero",
    sortOrder: int(formData, "sortOrder") ?? 0,
    isActive: checked(formData, "isActive"),
  };
}

export async function saveHomeBlockAction(id: string | null, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(() =>
    id
      ? api(`/admin/home-blocks/${id}`, { method: "PATCH", json: payload(formData) })
      : api("/admin/home-blocks", { method: "POST", json: payload(formData) }),
  );
  if (result.error) return result;
  revalidatePath("/home-blocks");
  redirect("/home-blocks");
}

export async function deleteHomeBlockAction(id: string) {
  const result = await runAction(() => api(`/admin/home-blocks/${id}`, { method: "DELETE" }));
  revalidatePath("/home-blocks");
  return result;
}
