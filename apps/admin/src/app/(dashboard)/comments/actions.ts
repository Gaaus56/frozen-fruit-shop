"use server";

import { revalidatePath } from "next/cache";
import type { CommentStatus } from "@frozen-fruit-shop/types";
import { api, runAction, type ActionState } from "@/lib/api";
import { text } from "@/lib/format";

export async function setCommentStatusAction(id: string, status: CommentStatus) {
  await api(`/admin/comments/${id}`, { method: "PATCH", json: { status } });
  revalidatePath("/comments");
  revalidatePath("/", "layout");
}

/** Lưu câu trả lời của cửa hàng; trả lời bình luận đang chờ thì API tự duyệt luôn. */
export async function saveCommentReplyAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const reply = text(formData, "reply");
  const result = await runAction(
    () => api(`/admin/comments/${id}`, { method: "PATCH", json: { reply } }),
    reply ? "Đã lưu trả lời — hiện ngay dưới bình luận trên web." : "Đã xoá trả lời.",
  );
  revalidatePath("/comments");
  revalidatePath("/", "layout");
  return result;
}

export async function deleteCommentAction(id: string) {
  const result = await runAction(() => api(`/admin/comments/${id}`, { method: "DELETE" }));
  revalidatePath("/comments");
  revalidatePath("/", "layout");
  return result;
}
