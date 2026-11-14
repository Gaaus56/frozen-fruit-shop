"use server";

import { revalidatePath } from "next/cache";
import { MAX_PRODUCT_ASSURANCES, type ProductAssurance, type SiteSettings } from "@frozen-fruit-shop/types";
import { api, runAction, type ActionState } from "@/lib/api";
import { checked, text } from "@/lib/format";

const FIELDS: Exclude<keyof SiteSettings, "marqueeEnabled" | "productAssurances">[] = [
  "storeName",
  "shortName",
  "phone",
  "hotlineHours",
  "email",
  "address",
  "addressLandmark",
  "mapUrl",
  "facebookUrl",
  "zaloPhone",
  "taxCode",
  "taxNote",
  "marqueeText",
  "bankTransferInfo",
];

export async function saveSettingsAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const data = {
    ...Object.fromEntries(FIELDS.map((field) => [field, text(formData, field)])),
    marqueeEnabled: checked(formData, "marqueeEnabled"),
    // Ô bỏ trống tiêu đề thì API tự bỏ đi.
    productAssurances: Array.from({ length: MAX_PRODUCT_ASSURANCES }, (_, index): ProductAssurance => ({
      icon: text(formData, `assurance${index}Icon`),
      title: text(formData, `assurance${index}Title`),
      text: text(formData, `assurance${index}Text`),
      linkUrl: text(formData, `assurance${index}Link`),
    })),
  } as unknown as SiteSettings;
  const result = await runAction(() => api("/admin/settings", { method: "PUT", json: data }), "Đã lưu. Website khách hàng cập nhật ngay.");
  revalidatePath("/settings");
  return result;
}
