"use client";

import { useActionState } from "react";
import type { Category } from "@frozen-fruit-shop/types";
import { LinkButton, SubmitButton } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, inputClass } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { saveCategoryAction } from "./actions";
import { UnsavedChangesGuard } from "@/components/ui/unsaved-changes-guard";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction] = useActionState(saveCategoryAction.bind(null, category?.id ?? null), undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5 border border-divider bg-surface p-6">
      <UnsavedChangesGuard state={state} />
      <Field label="Tên danh mục" htmlFor="name" required>
        <input id="name" name="name" required maxLength={120} defaultValue={category?.name} placeholder="Ví dụ: Xoài đông lạnh" className={inputClass} />
      </Field>
      <Field label="Đường dẫn (slug)" htmlFor="slug" hint="Để trống để tự tạo từ tên. Chỉ gồm chữ thường không dấu, số và dấu gạch ngang.">
        <input id="slug" name="slug" defaultValue={category?.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="xoai-dong-lanh" className={inputClass} />
      </Field>
      <Field label="Mô tả ngắn" htmlFor="description" hint="Hiện ở đầu trang sản phẩm khi khách lọc theo danh mục này.">
        <textarea id="description" name="description" rows={3} maxLength={1000} defaultValue={category?.description} className={inputClass} />
      </Field>
      <Field label="Ảnh đại diện">
        <ImageUpload name="image" defaultValue={category?.image} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Thứ tự hiển thị" htmlFor="sortOrder" hint="Số nhỏ hiện trước.">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className={inputClass} />
        </Field>
      </div>
      <Checkbox name="isActive" label="Hiển thị trên website" defaultChecked={category?.isActive ?? true} hint="Tắt để ẩn danh mục và toàn bộ sản phẩm trong danh mục khỏi web khách." />

      <FormAlert state={state} />
      <div className="flex gap-3">
        <SubmitButton>{category ? "Lưu thay đổi" : "Tạo danh mục"}</SubmitButton>
        <LinkButton href="/categories" variant="secondary">Huỷ</LinkButton>
      </div>
    </form>
  );
}
