"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, runAction, type ActionState } from "@/lib/api";
import { checked, text } from "@/lib/format";

function payload(formData: FormData) {
  // <input type="datetime-local"> không có múi giờ — hiểu theo giờ Việt Nam.
  const publishedAt = text(formData, "publishedAt");
  return {
    title: text(formData, "title"),
    slug: text(formData, "slug") || undefined,
    excerpt: text(formData, "excerpt"),
    content: String(formData.get("content") ?? ""),
    coverImage: text(formData, "coverImage") || null,
    category: text(formData, "category"),
    isPublished: checked(formData, "isPublished"),
    publishedAt: publishedAt ? new Date(`${publishedAt}:00+07:00`).toISOString() : undefined,
  };
}

export async function savePostAction(id: string | null, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(() =>
    id
      ? api(`/admin/posts/${id}`, { method: "PATCH", json: payload(formData) })
      : api("/admin/posts", { method: "POST", json: payload(formData) }),
  );
  if (result.error) return result;
  revalidatePath("/posts");
  redirect("/posts");
}

export async function deletePostAction(id: string) {
  const result = await runAction(() => api(`/admin/posts/${id}`, { method: "DELETE" }));
  revalidatePath("/posts");
  return result;
}
