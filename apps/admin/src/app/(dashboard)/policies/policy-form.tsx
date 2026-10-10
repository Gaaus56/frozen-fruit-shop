"use client";

import { useActionState } from "react";
import type { Policy } from "@frozen-fruit-shop/types";
import { LinkButton, SubmitButton } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, inputClass } from "@/components/ui/form";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import type { ProductOption } from "@/components/editor/extensions";
import { savePolicyAction } from "./actions";

type Draft = Pick<Policy, "title" | "slug" | "content">;

export function PolicyForm({ policy, template, products }: { policy?: Policy; template?: Draft; products: ProductOption[] }) {
  const [state, formAction] = useActionState(savePolicyAction.bind(null, policy?.id ?? null), undefined);
  const initial = policy ?? template;

  return (
    <form action={formAction} className="flex max-w-4xl flex-col gap-5 border border-divider bg-surface p-6">
      <Field label="Tiêu đề" htmlFor="title" required>
        <input id="title" name="title" required maxLength={150} defaultValue={initial?.title} className={inputClass} />
      </Field>
      <Field label="Đường dẫn (slug)" htmlFor="slug" hint="Để trống để tự tạo từ tiêu đề. Trang nằm ở địa chỉ /policies/slug trên web.">
        <input id="slug" name="slug" defaultValue={initial?.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} />
      </Field>
      <Field label="Nội dung" hint="Dùng Tiêu đề / Tiêu đề nhỏ để chia mục, khung Ghi chú / Cảnh báo cho điều cần nhấn mạnh.">
        <RichTextEditor name="content" defaultValue={initial?.content} products={products} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Thứ tự ở chân trang" htmlFor="sortOrder" hint="Số nhỏ hiện trước.">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={policy?.sortOrder ?? 0} className={inputClass} />
        </Field>
      </div>
      <Checkbox name="isActive" label="Hiển thị trên website" hint="Chính sách đang hiển thị được liệt kê ở chân trang web." defaultChecked={policy?.isActive ?? true} />

      <FormAlert state={state} />
      <div className="flex gap-3">
        <SubmitButton>{policy ? "Lưu thay đổi" : "Tạo chính sách"}</SubmitButton>
        <LinkButton href="/policies" variant="secondary">Huỷ</LinkButton>
      </div>
    </form>
  );
}
