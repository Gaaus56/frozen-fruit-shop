"use server";

import { revalidatePath } from "next/cache";
import type { InquiryStatus } from "@frozen-fruit-shop/types";
import { api, runAction } from "@/lib/api";

export async function setInquiryStatusAction(id: string, status: InquiryStatus) {
  await api(`/admin/inquiries/${id}`, { method: "PATCH", json: { status } });
  revalidatePath("/inquiries");
  revalidatePath("/", "layout");
}

export async function deleteInquiryAction(id: string) {
  const result = await runAction(() => api(`/admin/inquiries/${id}`, { method: "DELETE" }));
  revalidatePath("/inquiries");
  return result;
}
