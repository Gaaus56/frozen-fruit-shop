"use client";

import { useActionState, useState } from "react";
import { FormAlert, inputClass } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/button";
import { saveCommentReplyAction } from "./actions";

/** Trả lời ngay trong danh sách; đã có trả lời thì mở sẵn để sửa. */
export function ReplyForm({ id, reply }: { id: string; reply: string }) {
  const [open, setOpen] = useState(Boolean(reply));
  const [state, formAction] = useActionState(saveCommentReplyAction.bind(null, id), undefined);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-divider px-3 py-1.5 text-xs font-bold hover:border-leaf-600 hover:text-leaf-700"
      >
        Trả lời
      </button>
    );
  }
  return (
    <form action={formAction} className="mt-1 flex w-full flex-col gap-2">
      <textarea
        name="reply"
        rows={2}
        maxLength={2000}
        defaultValue={reply}
        placeholder="Trả lời của cửa hàng — hiện ngay dưới bình luận trên web"
        className={`${inputClass} mt-0`}
      />
      <FormAlert state={state} />
      <div className="flex gap-2">
        <SubmitButton size="sm">{reply ? "Lưu trả lời" : "Gửi trả lời"}</SubmitButton>
        {!reply ? (
          <button type="button" onClick={() => setOpen(false)} className="px-2 text-xs font-semibold text-foreground/60 hover:text-foreground">
            Huỷ
          </button>
        ) : null}
      </div>
    </form>
  );
}
