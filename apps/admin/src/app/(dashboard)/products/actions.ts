"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, runAction, type ActionState } from "@/lib/api";
import { checked, int, text } from "@/lib/format";

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  try {
    return JSON.parse(String(value ?? "")) as T;
  } catch {
    return fallback;
  }
}

function payload(formData: FormData) {
  const images = parseJson<string[]>(formData.get("images"), []);
  return {
    name: text(formData, "name"),
    slug: text(formData, "slug") || undefined,
    categoryId: text(formData, "categoryId"),
    shortDescription: text(formData, "shortDescription"),
    description: String(formData.get("description") ?? ""),
    storageTemperature: text(formData, "storageTemperature"),
    shelfLifeDays: int(formData, "shelfLifeDays"),
    thawInstructions: text(formData, "thawInstructions"),
    isFeatured: checked(formData, "isFeatured"),
    isWholesaleAvailable: checked(formData, "isWholesaleAvailable"),
    isActive: checked(formData, "isActive"),
    sortOrder: int(formData, "sortOrder") ?? 0,
    images: images.map((url) => ({ url })),
    variants: parseJson<unknown[]>(formData.get("variants"), []),
  };
}

export async function saveProductAction(id: string | null, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const result = await runAction(() =>
    id
      ? api(`/admin/products/${id}`, { method: "PATCH", json: payload(formData) })
      : api("/admin/products", { method: "POST", json: payload(formData) }),
  );
  if (result.error) return result;
  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProductAction(id: string) {
  const result = await runAction(() => api(`/admin/products/${id}`, { method: "DELETE" }));
  revalidatePath("/products");
  return result;
}

/** Bật/tắt nhanh hiển thị sản phẩm ngay từ danh sách. */
export async function toggleProductActiveAction(id: string, isActive: boolean) {
  await api(`/admin/products/${id}`, { method: "PATCH", json: { isActive } });
  revalidatePath("/products");
}
