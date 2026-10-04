"use server";

import { revalidatePath } from "next/cache";
import type { SiteSettings } from "@frozen-fruit-shop/types";
import { api, runAction, type ActionState } from "@/lib/api";
import { checked, text } from "@/lib/format";

const FIELDS: Exclude<keyof SiteSettings, "marqueeEnabled">[] = [
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
  } as unknown as SiteSettings;
  const result = await runAction(() => api("/admin/settings", { method: "PUT", json: data }), "Đã lưu. Website khách hàng cập nhật ngay.");
  revalidatePath("/settings");
  return result;
}
