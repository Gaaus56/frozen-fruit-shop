"use server";

import { revalidatePath } from "next/cache";
import type { PageSlug } from "@frozen-fruit-shop/types";
import { api, runAction, type ActionState } from "@/lib/api";
import { text } from "@/lib/format";

export async function savePageAction(slug: PageSlug, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    () =>
      api(`/admin/pages/${slug}`, {
        method: "PUT",
        json: {
          title: text(formData, "title"),
          description: text(formData, "description"),
          content: String(formData.get("content") ?? ""),
        },
      }),
    "Đã lưu. Trang trên website đã được cập nhật.",
  );
  revalidatePath(`/pages/${slug}`);
  return result;
}
