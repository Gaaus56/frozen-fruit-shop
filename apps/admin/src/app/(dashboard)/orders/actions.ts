"use server";

import { revalidatePath } from "next/cache";
import { api, runAction, type ActionState } from "@/lib/api";
import { int, text } from "@/lib/format";

export async function updateOrderAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const status = text(formData, "quickStatus") || text(formData, "status");
  const payload = {
    status: status || undefined,
    paymentStatus: text(formData, "paymentStatus") || undefined,
    shippingFee: formData.has("shippingFee") ? (int(formData, "shippingFee") ?? 0) : undefined,
    discount: formData.has("discount") ? (int(formData, "discount") ?? 0) : undefined,
    internalNote: text(formData, "internalNote"),
    note: text(formData, "note") || undefined,
  };

  const result = await runAction(() => api(`/admin/orders/${id}`, { method: "PATCH", json: payload }), "Đã cập nhật đơn hàng.");
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  return result;
}
