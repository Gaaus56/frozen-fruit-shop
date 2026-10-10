"use client";

import { useActionState } from "react";
import type { Page } from "@frozen-fruit-shop/types";
import type { ProductOption } from "@/components/editor/extensions";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { SubmitButton } from "@/components/ui/button";
import { Field, FormAlert, inputClass } from "@/components/ui/form";
import { savePageAction } from "./actions";

/** Sửa trang nội dung cố định (trang Giới thiệu): tiêu đề, dòng giới thiệu, nội dung có định dạng. */
export function PageForm({ page, products }: { page: Page; products: ProductOption[] }) {
  const [state, formAction] = useActionState(savePageAction.bind(null, page.slug), undefined);

  return (
    <form action={formAction} className="flex max-w-4xl flex-col gap-5 border border-divider bg-surface p-6">
      {page.updatedAt === null ? (
        <p className="border border-leaf-100 bg-leaf-50 px-4 py-3 text-sm text-leaf-700">
          Đây là nội dung đang hiển thị trên web. Sửa trực tiếp rồi bấm <b>Lưu trang</b>.
        </p>
      ) : null}
      <Field label="Tiêu đề trang" htmlFor="title" required>
        <input id="title" name="title" required maxLength={150} defaultValue={page.title} className={inputClass} />
      </Field>
      <Field label="Dòng giới thiệu ngắn" htmlFor="description" hint="Hiện ngay dưới tiêu đề.">
        <textarea id="description" name="description" rows={2} maxLength={300} defaultValue={page.description} className={inputClass} />
      </Field>
      <Field label="Nội dung" hint="Chia mục bằng Tiêu đề / Tiêu đề nhỏ; chèn ảnh cửa hàng (kèm chú thích) và ô sản phẩm ở bất cứ đâu.">
        <RichTextEditor name="content" defaultValue={page.content} products={products} />
      </Field>
      <FormAlert state={state} />
      <div>
        <SubmitButton>Lưu trang</SubmitButton>
      </div>
    </form>
  );
}
